const pool = require("../config/database");

const isDuplicateKeyError = (error) =>
  error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062);

// Get all aplikasi dengan JOIN ke tabel master
exports.getAllAplikasi = async (req, res) => {
  try {
    const query = `
      SELECT 
        da.nama_aplikasi,
        da.domain,
        da.deskripsi_fungsi,
        da.bahasa_pemrograman,
        da.basis_data,
        da.status_bmn,
        da.pic_internal AS nama_pic_internal,
        da.pic_eksternal AS nama_pic_eksternal,
        da.va_pt_waktu,
        da.eselon1_id,
        da.eselon2_id,
        e1.nama_eselon1,
        e2.nama_eselon2,
        ca.nama_cara_akses,
        fp.nama_frekuensi,
        sa.nama_status,
        pdn.kode_pdn,
        env.jenis_environment
      FROM data_aplikasi da
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
      LEFT JOIN cara_akses ca ON da.cara_akses_id = ca.cara_akses_id
      LEFT JOIN frekuensi_pemakaian fp ON da.frekuensi_pemakaian = fp.frekuensi_pemakaian
      LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN pdn ON da.pdn_id = pdn.pdn_id
      LEFT JOIN environment env ON da.environment_id = env.environment_id
      ORDER BY da.nama_aplikasi
    `;
    const [rows] = await pool.query(query);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data aplikasi",
      error: error.message,
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
        ca.nama_cara_akses,
        fp.nama_frekuensi,
        sa.nama_status,
        pdn.kode_pdn,
        env.jenis_environment
      FROM data_aplikasi da
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
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
    const {
      nama_aplikasi,
      eselon1_id,
      eselon2_id,
      cara_akses_id,
      cara_akses_multiple,
      frekuensi_pemakaian,
      status_aplikasi,
      pdn_id,
      environment_id,
      pic_internal,
      pic_eksternal,
      domain,
      deskripsi_fungsi,
      user_pengguna,
      data_digunakan,
      luaran_output,
      server_aplikasi,
      tipe_lisensi_bahasa,
      bahasa_pemrograman,
      basis_data,
      kerangka_pengembangan,
      unit_pengembang,
      unit_operasional_teknologi,
      nilai_pengembangan_aplikasi,
      pusat_komputasi_utama,
      pusat_komputasi_backup,
      mandiri_komputasi_backup,
      perangkat_lunak,
      cloud,
      ssl,
      waf,
      antivirus,
      va_pt_status,
      va_pt_waktu,
      alamat_ip_publik,
      keterangan,
      status_bmn,
      api_internal_status,
    } = req.body;

    const normalizedNamaAplikasi =
      typeof nama_aplikasi === "string" ? nama_aplikasi.trim() : nama_aplikasi;

    if (!normalizedNamaAplikasi) {
      return res.status(400).json({
        success: false,
        message: "Nama aplikasi wajib diisi",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO data_aplikasi 
       (\`nama_aplikasi\`, \`eselon1_id\`, \`eselon2_id\`, \`cara_akses_id\`, \`cara_akses_multiple\`, \`frekuensi_pemakaian\`, 
        \`status_aplikasi\`, \`pdn_id\`, \`environment_id\`, \`pic_internal\`, \`pic_eksternal\`, 
        \`domain\`, \`deskripsi_fungsi\`, \`user_pengguna\`, \`data_digunakan\`, \`luaran_output\`,
        \`server_aplikasi\`, \`tipe_lisensi_bahasa\`, \`bahasa_pemrograman\`, \`basis_data\`, 
        \`kerangka_pengembangan\`, \`unit_pengembang\`, \`unit_operasional_teknologi\`, 
        \`nilai_pengembangan_aplikasi\`, \`pusat_komputasi_utama\`, \`pusat_komputasi_backup\`, 
        \`mandiri_komputasi_backup\`, \`perangkat_lunak\`, \`cloud\`, \`ssl\`, \`waf\`, \`antivirus\`, 
        \`va_pt_status\`, \`va_pt_waktu\`, \`alamat_ip_publik\`, \`keterangan\`, \`status_bmn\`, 
        \`api_internal_status\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedNamaAplikasi,
        eselon1_id,
        eselon2_id,
        cara_akses_id,
        cara_akses_multiple,
        frekuensi_pemakaian,
        status_aplikasi,
        pdn_id,
        environment_id,
        pic_internal,
        pic_eksternal,
        domain,
        deskripsi_fungsi,
        user_pengguna,
        data_digunakan,
        luaran_output,
        server_aplikasi,
        tipe_lisensi_bahasa,
        bahasa_pemrograman,
        basis_data,
        kerangka_pengembangan,
        unit_pengembang,
        unit_operasional_teknologi,
        nilai_pengembangan_aplikasi,
        pusat_komputasi_utama,
        pusat_komputasi_backup,
        mandiri_komputasi_backup,
        perangkat_lunak,
        cloud,
        ssl,
        waf,
        antivirus,
        va_pt_status,
        va_pt_waktu,
        alamat_ip_publik,
        keterangan,
        status_bmn,
        api_internal_status,
      ]
    );
    res.status(201).json({
      success: true,
      message: "Aplikasi berhasil ditambahkan",
      data: { nama_aplikasi: normalizedNamaAplikasi, domain },
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
    const {
      nama_aplikasi,
      eselon1_id,
      eselon2_id,
      cara_akses_id,
      cara_akses_multiple,
      frekuensi_pemakaian,
      status_aplikasi,
      pdn_id,
      pdn_backup,
      environment_id,
      pic_internal,
      pic_eksternal,
      kontak_pic_internal,
      kontak_pic_eksternal,
      domain,
      deskripsi_fungsi,
      user_pengguna,
      data_digunakan,
      luaran_output,
      server_aplikasi,
      tipe_lisensi_bahasa,
      bahasa_pemrograman,
      basis_data,
      kerangka_pengembangan,
      unit_pengembang,
      unit_operasional_teknologi,
      nilai_pengembangan_aplikasi,
      pusat_komputasi_utama,
      pusat_komputasi_backup,
      mandiri_komputasi_backup,
      perangkat_lunak,
      cloud,
      ssl,
      waf,
      antivirus,
      va_pt_status,
      va_pt_waktu,
      alamat_ip_publik,
      keterangan,
      status_bmn,
      api_internal_status,
    } = req.body;

    const normalizedNamaAplikasi =
      typeof nama_aplikasi === "string" ? nama_aplikasi.trim() : nama_aplikasi;

    if (!normalizedNamaAplikasi) {
      return res.status(400).json({
        success: false,
        message: "Nama aplikasi wajib diisi",
      });
    }

    const [result] = await pool.query(
      `UPDATE data_aplikasi SET 
       \`nama_aplikasi\` = ?, \`eselon1_id\` = ?, \`eselon2_id\` = ?, \`cara_akses_id\` = ?, \`cara_akses_multiple\` = ?, \`frekuensi_pemakaian\` = ?, 
       \`status_aplikasi\` = ?, \`pdn_id\` = ?, \`environment_id\` = ?, \`pic_internal\` = ?, 
       \`pic_eksternal\` = ?, \`kontak_pic_internal\` = ?, \`kontak_pic_eksternal\` = ?, \`domain\` = ?, \`deskripsi_fungsi\` = ?, \`user_pengguna\` = ?, 
       \`data_digunakan\` = ?, \`luaran_output\` = ?, \`server_aplikasi\` = ?, \`tipe_lisensi_bahasa\` = ?, 
       \`bahasa_pemrograman\` = ?, \`basis_data\` = ?, \`kerangka_pengembangan\` = ?, \`unit_pengembang\` = ?, 
       \`unit_operasional_teknologi\` = ?, \`nilai_pengembangan_aplikasi\` = ?, 
       \`pusat_komputasi_utama\` = ?, \`pusat_komputasi_backup\` = ?, \`mandiri_komputasi_backup\` = ?, 
       \`perangkat_lunak\` = ?, \`cloud\` = ?, \`ssl\` = ?, \`waf\` = ?, \`antivirus\` = ?, \`va_pt_status\` = ?, 
       \`va_pt_waktu\` = ?, \`alamat_ip_publik\` = ?, \`keterangan\` = ?, \`status_bmn\` = ?, 
       \`api_internal_status\` = ? 
       WHERE \`nama_aplikasi\` = ?`,
      [
        normalizedNamaAplikasi,
        eselon1_id,
        eselon2_id,
        cara_akses_id,
        cara_akses_multiple,
        frekuensi_pemakaian,
        status_aplikasi,
        pdn_id,
        environment_id,
        pic_internal,
        pic_eksternal,
        kontak_pic_internal,
        kontak_pic_eksternal,
        domain,
        deskripsi_fungsi,
        user_pengguna,
        data_digunakan,
        luaran_output,
        server_aplikasi,
        tipe_lisensi_bahasa,
        bahasa_pemrograman,
        basis_data,
        kerangka_pengembangan,
        unit_pengembang,
        unit_operasional_teknologi,
        nilai_pengembangan_aplikasi,
        pusat_komputasi_utama,
        pusat_komputasi_backup,
        mandiri_komputasi_backup,
        perangkat_lunak,
        cloud,
        ssl,
        waf,
        antivirus,
        va_pt_status,
        va_pt_waktu,
        alamat_ip_publik,
        keterangan,
        status_bmn,
        api_internal_status,
        req.params.id,
      ]
    );
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
      [req.params.id]
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
