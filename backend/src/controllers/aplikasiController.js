const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const {
  logAudit,
  getIpAddress,
  getUserAgent,
} = require("../utils/auditLogger");
const {
  encryptAkunPassword,
  decryptAkunPassword,
} = require("../utils/fieldEncryption");
const { NotFoundError } = require("../middleware/errorHandler");

const isDuplicateKeyError = (error) =>
  error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062);

/**
 * Helper function to record application updates for dashboard display
 * @param {object} params - Update parameters
 * @param {string} params.namaAplikasi - Application name
 * @param {string} params.actionType - 'CREATE' or 'UPDATE'
 * @param {object} params.data - Application data (body from request)
 * @param {string} params.changedFields - Comma-separated changed fields (for UPDATE)
 * @param {string} params.userId - User ID who performed the action
 * @param {string} params.ipAddress - IP address
 * @param {string} params.userAgent - User agent string
 */
const recordApplicationUpdate = async (params) => {
  try {
    const { namaAplikasi, actionType, data, changedFields, userId, ipAddress, userAgent } = params;

    // Fetch related data for snapshot
    const [appData] = await pool.query(`
      SELECT 
        da.status_aplikasi,
        sa.nama_status,
        da.eselon1_id,
        e1.nama_eselon1,
        da.eselon2_id,
        e2.nama_eselon2,
        da.upt_id,
        upt.nama_upt,
        da.domain
      FROM data_aplikasi da
      LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
      LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
      WHERE da.nama_aplikasi = ?
      LIMIT 1
    `, [namaAplikasi]);

    if (appData.length === 0) return; // App not found, skip

    const app = appData[0];

    await pool.query(`
      INSERT INTO application_updates 
        (nama_aplikasi, action_type, status_aplikasi_id, status_aplikasi_name,
         eselon1_id, eselon1_name, eselon2_id, eselon2_name, upt_id, upt_name,
         domain, changed_fields, updated_by, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      namaAplikasi,
      actionType,
      app.status_aplikasi,
      app.nama_status,
      app.eselon1_id,
      app.nama_eselon1,
      app.eselon2_id,
      app.nama_eselon2,
      app.upt_id,
      app.nama_upt,
      app.domain,
      changedFields || null,
      userId || 'system',
      ipAddress,
      userAgent
    ]);
  } catch (error) {
    // Log error but don't throw - this is supplementary tracking
    console.error('Failed to record application update:', error);
  }
};

const sanitizeAksesAkunBody = (body) => {
  const next = { ...(body || {}) };

  // Never accept encrypted password directly from client
  if (
    Object.prototype.hasOwnProperty.call(next, "akses_aplikasi_password_enc")
  ) {
    delete next.akses_aplikasi_password_enc;
  }

  if (
    typeof next.akses_aplikasi_username === "string" &&
    next.akses_aplikasi_username.trim() === ""
  ) {
    next.akses_aplikasi_username = null;
  }

  const rawPassword =
    typeof next.akses_aplikasi_password === "string"
      ? next.akses_aplikasi_password
      : "";

  // Konfirmasi password never stored
  if (
    Object.prototype.hasOwnProperty.call(
      next,
      "akses_aplikasi_konfirmasi_password",
    )
  ) {
    delete next.akses_aplikasi_konfirmasi_password;
  }

  if (Object.prototype.hasOwnProperty.call(next, "akses_aplikasi_password")) {
    delete next.akses_aplikasi_password;
  }

  const trimmedPassword = rawPassword.trim();
  if (trimmedPassword) {
    next.akses_aplikasi_password_enc = encryptAkunPassword(trimmedPassword);
  }

  return next;
};

const stripSensitiveAkunFields = (row) => {
  const safe = { ...(row || {}) };
  if (
    Object.prototype.hasOwnProperty.call(safe, "akses_aplikasi_password_enc")
  ) {
    delete safe.akses_aplikasi_password_enc;
  }
  return safe;
};

const stripSensitiveAkunFieldsWithDecryptedPassword = (row) => {
  const safe = stripSensitiveAkunFields(row);

  if (!row || !row.akses_aplikasi_password_enc) return safe;

  try {
    safe.akses_aplikasi_password = decryptAkunPassword(
      row.akses_aplikasi_password_enc,
    );
  } catch (e) {
    // Keep API functional even if key is missing/invalid or ciphertext is malformed
    console.warn(
      "Failed to decrypt akses_aplikasi_password_enc for aplikasi detail:",
      e?.code || e?.message || e,
    );
    safe.akses_aplikasi_password = "";
  }

  return safe;
};

const stripSensitiveForAudit = (body) => {
  const safe = { ...(body || {}) };
  delete safe.akses_aplikasi_password_enc;
  delete safe.akses_aplikasi_password;
  delete safe.akses_aplikasi_konfirmasi_password;
  return safe;
};

// Get all aplikasi dengan JOIN ke tabel master
exports.getAllAplikasi = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      da.*,
      e1.nama_eselon1,
      e2.nama_eselon2,
      upt.nama_upt,
      ca.nama_cara_akses,
      fp.nama_frekuensi,
      sa.nama_status,
      pdn.kode_pdn AS nama_pdn,
      env.jenis_environment AS nama_environment,
      COALESCE(pi.nama_pic_internal, da.pic_internal) AS nama_pic_internal,
      COALESCE(pi.kontak_pic_internal, da.kontak_pic_internal) AS kontak_pic_internal,
      COALESCE(pe.nama_pic_eksternal, da.pic_eksternal) AS nama_pic_eksternal,
      COALESCE(pe.kontak_pic_eksternal, da.kontak_pic_eksternal) AS kontak_pic_eksternal
    FROM data_aplikasi da
    LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
    LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
    LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
    LEFT JOIN cara_akses ca ON da.cara_akses_id = ca.cara_akses_id
    LEFT JOIN frekuensi_pemakaian fp ON da.frekuensi_pemakaian = fp.frekuensi_pemakaian
    LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
    LEFT JOIN pdn ON da.pdn_id = pdn.pdn_id
    LEFT JOIN environment env ON da.environment_id = env.environment_id
    LEFT JOIN pic_internal pi ON da.pic_internal_id = pi.pic_internal_id
    LEFT JOIN pic_eksternal pe ON da.pic_eksternal_id = pe.pic_eksternal_id
    ORDER BY da.nama_aplikasi
  `;

  console.log("Executing query...");
  const [rows] = await pool.query(query);
  console.log(`Query successful, returned ${rows.length} rows`);

  const sanitizedRows = rows.map((r) => stripSensitiveAkunFields(r));

  res.json({
    success: true,
    data: sanitizedRows,
  });
  // Error otomatis di-catch oleh asyncHandler dan diteruskan ke errorHandler
});

// Get aplikasi by nama
exports.getAplikasiById = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      da.*,
      e1.nama_eselon1,
      e2.nama_eselon2,
      upt.nama_upt,
      ca.nama_cara_akses,
      fp.nama_frekuensi,
      sa.nama_status,
      pdn.kode_pdn,
      env.jenis_environment
    FROM data_aplikasi da
    LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
    LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
    LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
    LEFT JOIN cara_akses ca ON da.cara_akses_id = ca.cara_akses_id
    LEFT JOIN frekuensi_pemakaian fp ON da.frekuensi_pemakaian = fp.frekuensi_pemakaian
    LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
    LEFT JOIN pdn ON da.pdn_id = pdn.pdn_id
    LEFT JOIN environment env ON da.environment_id = env.environment_id
    WHERE da.nama_aplikasi = ?
  `;
  const [rows] = await pool.query(query, [req.params.id]);

  if (rows.length === 0) {
    throw new NotFoundError(
      `Aplikasi dengan nama '${req.params.id}' tidak ditemukan`,
    );
  }

  res.json({
    success: true,
    data: stripSensitiveAkunFieldsWithDecryptedPassword(rows[0]),
  });
});

// Create aplikasi
exports.createAplikasi = asyncHandler(async (req, res) => {
  const sanitizedBody = sanitizeAksesAkunBody(req.body);

  const normalizedNamaAplikasi =
    typeof sanitizedBody.nama_aplikasi === "string"
      ? sanitizedBody.nama_aplikasi.trim()
      : sanitizedBody.nama_aplikasi;

  if (!normalizedNamaAplikasi) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi wajib diisi",
    });
  }

  // Check for duplicate nama_aplikasi
  const [existingByNama] = await pool.query(
    "SELECT nama_aplikasi FROM data_aplikasi WHERE nama_aplikasi = ?",
    [normalizedNamaAplikasi]
  );

  if (existingByNama.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi sudah terdaftar",
    });
  }

  // Check for duplicate domain (only if domain is provided and not empty)
  const normalizedDomain = 
    typeof sanitizedBody.domain === "string" 
      ? sanitizedBody.domain.trim() 
      : sanitizedBody.domain;

  if (normalizedDomain) {
    const [existingByDomain] = await pool.query(
      "SELECT nama_aplikasi, domain FROM data_aplikasi WHERE domain = ?",
      [normalizedDomain]
    );

    if (existingByDomain.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Domain sudah terdaftar",
      });
    }
  }

  // Build dynamic query to support all fields including dynamic master fields
  const fields = [];
  const values = [];
  const placeholders = [];

  // Process all fields from request body
  for (const [key, value] of Object.entries(sanitizedBody)) {
    fields.push(`\`${key}\``);
    values.push(value);
    placeholders.push("?");
  }

  // Override nama_aplikasi with normalized version
  const namaAplikasiIndex = fields.indexOf("`nama_aplikasi`");
  if (namaAplikasiIndex !== -1) {
    values[namaAplikasiIndex] = normalizedNamaAplikasi;
  }

  const query = `INSERT INTO data_aplikasi (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`;

  const [result] = await pool.query(query, values);
  res.status(201).json({
    success: true,
    message: "Aplikasi berhasil ditambahkan",
    data: {
      nama_aplikasi: normalizedNamaAplikasi,
      domain: sanitizedBody.domain,
    },
  });

  // Log audit untuk CREATE aplikasi
  await logAudit({
    userId: req.user?.userId,
    tableName: "data_aplikasi",
    action: "CREATE",
    recordId: result.insertId,
    newValues: { nama_aplikasi: normalizedNamaAplikasi },
    detail: `New application created: ${normalizedNamaAplikasi}`,
    description: `Aplikasi ${normalizedNamaAplikasi} ditambahkan ke sistem`,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });

  // Record application update for dashboard
  await recordApplicationUpdate({
    namaAplikasi: normalizedNamaAplikasi,
    actionType: 'CREATE',
    data: sanitizedBody,
    userId: req.user?.userId,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });
  // Duplicate error (ER_DUP_ENTRY) otomatis di-handle oleh errorHandler
});

// Update aplikasi
exports.updateAplikasi = asyncHandler(async (req, res) => {
  const sanitizedBody = sanitizeAksesAkunBody(req.body);

  const normalizedNamaAplikasi =
    typeof sanitizedBody.nama_aplikasi === "string"
      ? sanitizedBody.nama_aplikasi.trim()
      : sanitizedBody.nama_aplikasi;

  if (!normalizedNamaAplikasi) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi wajib diisi",
    });
  }

  // Check for duplicate nama_aplikasi (exclude current record)
  const [existingByNama] = await pool.query(
    "SELECT nama_aplikasi FROM data_aplikasi WHERE nama_aplikasi = ? AND nama_aplikasi != ?",
    [normalizedNamaAplikasi, req.params.id]
  );

  if (existingByNama.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi sudah terdaftar",
    });
  }

  // Check for duplicate domain (only if domain is provided and not empty, exclude current record)
  const normalizedDomain = 
    typeof sanitizedBody.domain === "string" 
      ? sanitizedBody.domain.trim() 
      : sanitizedBody.domain;

  if (normalizedDomain) {
    const [existingByDomain] = await pool.query(
      "SELECT nama_aplikasi, domain FROM data_aplikasi WHERE domain = ? AND nama_aplikasi != ?",
      [normalizedDomain, req.params.id]
    );

    if (existingByDomain.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Domain sudah terdaftar",
      });
    }
  }

  // Build dynamic UPDATE query to support all fields including dynamic master fields
  const updates = [];
  const values = [];

  // Process all fields from request body
  for (const [key, value] of Object.entries(sanitizedBody)) {
    updates.push(`\`${key}\` = ?`);
    values.push(value);
  }

  // Override nama_aplikasi with normalized version
  const namaAplikasiIndex = Object.keys(sanitizedBody).indexOf("nama_aplikasi");
  if (namaAplikasiIndex !== -1) {
    values[namaAplikasiIndex] = normalizedNamaAplikasi;
  }

  // Add WHERE parameter
  values.push(req.params.id);

  const query = `UPDATE data_aplikasi SET ${updates.join(", ")} WHERE \`nama_aplikasi\` = ?`;

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    throw new NotFoundError(
      `Aplikasi dengan nama '${req.params.id}' tidak ditemukan`,
    );
  }

  res.json({
    success: true,
    message: "Aplikasi berhasil diupdate",
  });

  // Log audit untuk UPDATE aplikasi
  await logAudit({
    userId: req.user?.userId,
    tableName: "data_aplikasi",
    action: "UPDATE",
    recordId: req.params.id,
    newValues: stripSensitiveForAudit(sanitizedBody),
    changes: Object.keys(stripSensitiveForAudit(sanitizedBody)).join(", "),
    detail: `Application updated: ${normalizedNamaAplikasi}`,
    description: `Data aplikasi ${normalizedNamaAplikasi} diubah`,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });

  // Record application update for dashboard
  await recordApplicationUpdate({
    namaAplikasi: normalizedNamaAplikasi || req.params.id,
    actionType: 'UPDATE',
    data: sanitizedBody,
    changedFields: Object.keys(stripSensitiveForAudit(sanitizedBody)).join(", "),
    userId: req.user?.userId,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });
  // Duplicate error otomatis di-handle oleh errorHandler
});

// Delete aplikasi
exports.deleteAplikasi = asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    "DELETE FROM data_aplikasi WHERE nama_aplikasi = ?",
    [req.params.id],
  );

  if (result.affectedRows === 0) {
    throw new NotFoundError(
      `Aplikasi dengan nama '${req.params.id}' tidak ditemukan`,
    );
  }

  res.json({
    success: true,
    message: "Aplikasi berhasil dihapus",
  });

  // Log audit untuk DELETE aplikasi
  await logAudit({
    userId: req.user?.userId,
    tableName: "data_aplikasi",
    action: "DELETE",
    recordId: req.params.id,
    detail: `Application deleted: ${req.params.id}`,
    description: `Aplikasi ${req.params.id} dihapus dari sistem`,
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req),
  });
  // Foreign key constraint error otomatis di-handle oleh errorHandler
});
