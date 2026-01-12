const pool = require('../config/database');

// Get all audit logs
exports.getAllAuditLogs = async (req, res) => {
  try {
    const query = `
      SELECT al.*, u.name as user_name 
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC 
      LIMIT 100
    `;
    const [rows] = await pool.query(query);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil audit log',
      error: error.message
    });
  }
};

// Get audit logs by user
exports.getAuditLogsByUser = async (req, res) => {
  try {
    const query = `
      SELECT al.*, u.name as user_name 
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.id 
      WHERE al.user_id = ? 
      ORDER BY al.created_at DESC
    `;
    const [rows] = await pool.query(query, [req.params.userId]);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil audit log user',
      error: error.message
    });
  }
};

// Create audit log
exports.createAuditLog = async (req, res) => {
  try {
    const { user_id, aksi, detail, ip_address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO audit_log (user_id, aksi, detail, ip_address) VALUES (?, ?, ?, ?)',
      [user_id, aksi, detail, ip_address]
    );
    res.status(201).json({
      success: true,
      message: 'Audit log berhasil ditambahkan',
      data: { id: result.insertId, user_id, aksi, detail, ip_address }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menambahkan audit log',
      error: error.message
    });
  }
};
