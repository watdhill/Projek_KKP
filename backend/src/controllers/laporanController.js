const pool = require('../config/database');

// Get all laporan
exports.getAllLaporan = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM laporan ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data laporan',
      error: error.message
    });
  }
};

// Get laporan by ID
exports.getLaporanById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM laporan WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data laporan',
      error: error.message
    });
  }
};

// Create laporan
exports.createLaporan = async (req, res) => {
  try {
    const { judul, tipe, status, tanggal_buat } = req.body;
    const [result] = await pool.query(
      'INSERT INTO laporan (judul, tipe, status, tanggal_buat) VALUES (?, ?, ?, ?)',
      [judul, tipe, status || 'Draft', tanggal_buat || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({
      success: true,
      message: 'Laporan berhasil ditambahkan',
      data: { id: result.insertId, judul, tipe, status, tanggal_buat }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menambahkan laporan',
      error: error.message
    });
  }
};

// Update laporan
exports.updateLaporan = async (req, res) => {
  try {
    const { judul, tipe, status, tanggal_buat } = req.body;
    const [result] = await pool.query(
      'UPDATE laporan SET judul = ?, tipe = ?, status = ?, tanggal_buat = ? WHERE id = ?',
      [judul, tipe, status, tanggal_buat, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: 'Laporan berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengupdate laporan',
      error: error.message
    });
  }
};

// Delete laporan
exports.deleteLaporan = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM laporan WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: 'Laporan berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menghapus laporan',
      error: error.message
    });
  }
};
