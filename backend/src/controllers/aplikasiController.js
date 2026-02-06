const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { logAudit, getIpAddress, getUserAgent } = require("../utils/auditLogger");
const { NotFoundError } = require("../middleware/errorHandler");

const isDuplicateKeyError = (error) =>
  error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062);

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

  res.json({
    success: true,
    data: rows,
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
    data: rows[0],
  });
});

// Create aplikasi
exports.createAplikasi = asyncHandler(async (req, res) => {
  const normalizedNamaAplikasi =
    typeof req.body.nama_aplikasi === "string"
      ? req.body.nama_aplikasi.trim()
      : req.body.nama_aplikasi;

  if (!normalizedNamaAplikasi) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi wajib diisi",
    });
  }

  // Cek domain duplikat jika domain diisi
  if (req.body.domain && req.body.domain.trim()) {
    const normalizedDomain = req.body.domain.trim();
    const [existingDomain] = await pool.query(
      "SELECT nama_aplikasi FROM data_aplikasi WHERE domain = ?",
      [normalizedDomain],
    );

    if (existingDomain.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Domain '${normalizedDomain}' sudah digunakan oleh aplikasi '${existingDomain[0].nama_aplikasi}'`,
        errorCode: "DUPLICATE_DOMAIN",
      });
    }
  }

  // Build dynamic query to support all fields including dynamic master fields
  const fields = [];
  const values = [];
  const placeholders = [];

  // Process all fields from request body
  for (const [key, value] of Object.entries(req.body)) {
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
    data: { nama_aplikasi: normalizedNamaAplikasi, domain: req.body.domain },
  });
  
    // Log audit untuk CREATE aplikasi
    await logAudit({
      userId: req.user?.userId,
      tableName: 'data_aplikasi',
      action: 'CREATE',
      recordId: result.insertId,
      newValues: { nama_aplikasi: normalizedNamaAplikasi },
      detail: `New application created: ${normalizedNamaAplikasi}`,
      description: `Aplikasi ${normalizedNamaAplikasi} ditambahkan ke sistem`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  // Duplicate error (ER_DUP_ENTRY) otomatis di-handle oleh errorHandler
});

// Update aplikasi
exports.updateAplikasi = asyncHandler(async (req, res) => {
  const normalizedNamaAplikasi =
    typeof req.body.nama_aplikasi === "string"
      ? req.body.nama_aplikasi.trim()
      : req.body.nama_aplikasi;

  if (!normalizedNamaAplikasi) {
    return res.status(400).json({
      success: false,
      message: "Nama aplikasi wajib diisi",
    });
  }

  // Cek domain duplikat jika domain diisi (kecuali untuk aplikasi ini sendiri)
  if (req.body.domain && req.body.domain.trim()) {
    const normalizedDomain = req.body.domain.trim();
    const [existingDomain] = await pool.query(
      "SELECT nama_aplikasi FROM data_aplikasi WHERE domain = ? AND nama_aplikasi != ?",
      [normalizedDomain, req.params.id],
    );

    if (existingDomain.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Domain '${normalizedDomain}' sudah digunakan oleh aplikasi '${existingDomain[0].nama_aplikasi}'`,
        errorCode: "DUPLICATE_DOMAIN",
      });
    }
  }

  // Build dynamic UPDATE query to support all fields including dynamic master fields
  const updates = [];
  const values = [];

  // Process all fields from request body
  for (const [key, value] of Object.entries(req.body)) {
    updates.push(`\`${key}\` = ?`);
    values.push(value);
  }

  // Override nama_aplikasi with normalized version
  const namaAplikasiIndex = Object.keys(req.body).indexOf("nama_aplikasi");
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
      tableName: 'data_aplikasi',
      action: 'UPDATE',
      recordId: req.params.id,
      newValues: req.body,
      changes: Object.keys(req.body).join(', '),
      detail: `Application updated: ${normalizedNamaAplikasi}`,
      description: `Data aplikasi ${normalizedNamaAplikasi} diubah`,
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
      tableName: 'data_aplikasi',
      action: 'DELETE',
      recordId: req.params.id,
      detail: `Application deleted: ${req.params.id}`,
      description: `Aplikasi ${req.params.id} dihapus dari sistem`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
  });
  // Foreign key constraint error otomatis di-handle oleh errorHandler
});
