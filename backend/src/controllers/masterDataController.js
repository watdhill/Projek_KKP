const pool = require('../config/database');

// Get all master data
exports.getAllMasterData = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM master_data ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil master data',
      error: error.message
    });
  }
};

// Get master data by ID
exports.getMasterDataById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM master_data WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master data tidak ditemukan'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil master data',
      error: error.message
    });
  }
};

// Create master data
exports.createMasterData = async (req, res) => {
  try {
    const { kategori, nama, deskripsi, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO master_data (kategori, nama, deskripsi, status) VALUES (?, ?, ?, ?)',
      [kategori, nama, deskripsi, status || 'Aktif']
    );
    res.status(201).json({
      success: true,
      message: 'Master data berhasil ditambahkan',
      data: { id: result.insertId, kategori, nama, deskripsi, status }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menambahkan master data',
      error: error.message
    });
  }
};

// Update master data
exports.updateMasterData = async (req, res) => {
  try {
    const { kategori, nama, deskripsi, status } = req.body;
    const [result] = await pool.query(
      'UPDATE master_data SET kategori = ?, nama = ?, deskripsi = ?, status = ? WHERE id = ?',
      [kategori, nama, deskripsi, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master data tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: 'Master data berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengupdate master data',
      error: error.message
    });
  }
};

// Delete master data
exports.deleteMasterData = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM master_data WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master data tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: 'Master data berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menghapus master data',
      error: error.message
    });
  }
};
