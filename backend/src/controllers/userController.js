const pool = require('../config/database');

// Get all users dengan JOIN tabel roles dan eselon
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.nama,
        u.nip,
        u.email,
        u.jabatan,
        u.status_aktif,
        r.nama_role,
        e1.nama_eselon1,
        e2.nama_eselon2
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN master_eselon1 e1 ON u.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON u.eselon2_id = e2.eselon2_id
      ORDER BY u.user_id
    `;
    const [rows] = await pool.query(query);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data users',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.nama,
        u.nip,
        u.email,
        u.jabatan,
        u.password,
        u.status_aktif,
        u.role_id,
        u.eselon1_id,
        u.eselon2_id,
        r.nama_role,
        e1.nama_eselon1,
        e2.nama_eselon2
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN master_eselon1 e1 ON u.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON u.eselon2_id = e2.eselon2_id
      WHERE u.user_id = ?
    `;
    const [rows] = await pool.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data user',
      error: error.message
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password]
    );
    res.status(201).json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: { user_id: result.insertId, nama, nip, email, jabatan }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menambahkan user',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password, status_aktif } = req.body;
    
    // Jika password tidak dikirim (kosong), jangan update password
    let query, params;
    if (password) {
      query = 'UPDATE users SET role_id = ?, eselon1_id = ?, eselon2_id = ?, nama = ?, nip = ?, email = ?, jabatan = ?, password = ?, status_aktif = ? WHERE user_id = ?';
      params = [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password, status_aktif, req.params.id];
    } else {
      query = 'UPDATE users SET role_id = ?, eselon1_id = ?, eselon2_id = ?, nama = ?, nip = ?, email = ?, jabatan = ?, status_aktif = ? WHERE user_id = ?';
      params = [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, status_aktif, req.params.id];
    }
    
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: 'User berhasil diupdate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengupdate user',
      error: error.message
    });
  }
};

// Deactivate user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    // Cek apakah user yang akan dinonaktifkan adalah Admin
    const [checkUser] = await pool.query(
      'SELECT u.user_id, r.nama_role FROM users u LEFT JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?',
      [req.params.id]
    );
    
    if (checkUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Cegah menonaktifkan Admin
    if (checkUser[0].nama_role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin tidak dapat dinonaktifkan'
      });
    }
    
    // Update status_aktif menjadi 0 (nonaktif)
    const [result] = await pool.query('UPDATE users SET status_aktif = 0 WHERE user_id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'User berhasil dinonaktifkan'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error menonaktifkan user',
      error: error.message
    });
  }
};
