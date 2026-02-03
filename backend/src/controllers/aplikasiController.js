const pool = require("../config/database");

const isDuplicateKeyError = (error) =>
  error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062);

// Get all aplikasi dengan JOIN ke tabel master
exports.getAllAplikasi = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error in getAllAplikasi:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    });
    res.status(500).json({
      success: false,
      message: "Error mengambil data aplikasi",
      error: error.message,
      sqlError: error.sqlMessage,
    });
  }
};

// Get aplikasi by nama
exports.getAplikasiById = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Aplikasi tidak ditemukan",
      });
    }
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data aplikasi",
      error: error.message,
    });
  }
};

// Create aplikasi
exports.createAplikasi = async (req, res) => {
  try {
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
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_NAMA_APLIKASI",
        message: "Nama aplikasi sudah terdaftar",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error menambahkan aplikasi",
      error: error.message,
    });
  }
};

// Update aplikasi
exports.updateAplikasi = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Aplikasi tidak ditemukan",
      });
    }
    res.json({
      success: true,
      message: "Aplikasi berhasil diupdate",
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_NAMA_APLIKASI",
        message: "Nama aplikasi sudah terdaftar",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error mengupdate aplikasi",
      error: error.message,
    });
  }
};

// Delete aplikasi
exports.deleteAplikasi = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM data_aplikasi WHERE nama_aplikasi = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Aplikasi tidak ditemukan",
      });
    }
    res.json({
      success: true,
      message: "Aplikasi berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menghapus aplikasi",
      error: error.message,
    });
  }
};
