const pool = require('../config/database');

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    const query = `
      SELECT 
        u.user_id,
        u.nama,
        u.email,
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
      WHERE u.email = ?
    `;
    const [rows] = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = rows[0];

    // Check status aktif
    if (user.status_aktif === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan'
      });
    }

    // Verifikasi password (untuk production, gunakan bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        role_id: user.role_id,
        nama_role: user.nama_role,
        eselon1_id: user.eselon1_id,
        eselon2_id: user.eselon2_id,
        nama_eselon1: user.nama_eselon1,
        nama_eselon2: user.nama_eselon2
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saat login',
      error: error.message
    });
  }
};

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
        u.kontak,
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
        u.kontak,
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
    const { role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, password } = req.body;
    
    // Validasi: semua field wajib diisi
    if (!nama || !email || !jabatan || !kontak || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }
    
    // Validasi: email harus berakhiran @kkp.go.id
    if (!email.endsWith('@kkp.go.id')) {
      return res.status(400).json({
        success: false,
        message: 'Email harus menggunakan domain @kkp.go.id'
      });
    }
    
    // Validasi: NIP harus 18 digit dan hanya angka
    if (nip) {
      if (!/^\d{18}$/.test(nip)) {
        return res.status(400).json({
          success: false,
          message: 'NIP harus 18 digit dan hanya berisi angka'
        });
      }
    }
    
    // Validasi: password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO users (role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, password, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, password]
    );
    res.status(201).json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: { user_id: result.insertId, nama, nip, email, jabatan, kontak }
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
    const { role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, password, status_aktif } = req.body;
    
    // Validasi: field wajib tidak boleh kosong
    if (!nama || !email || !jabatan || !kontak || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }
    
    // Validasi: email harus berakhiran @kkp.go.id
    if (!email.endsWith('@kkp.go.id')) {
      return res.status(400).json({
        success: false,
        message: 'Email harus menggunakan domain @kkp.go.id'
      });
    }
    
    // Validasi: NIP harus 18 digit dan hanya angka (jika diisi)
    if (nip) {
      if (!/^\d{18}$/.test(nip)) {
        return res.status(400).json({
          success: false,
          message: 'NIP harus 18 digit dan hanya berisi angka'
        });
      }
    }
    
    // Validasi password jika diubah
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)'
        });
      }
    }
    
    // Jika password tidak dikirim (kosong), jangan update password
    let query, params;
    if (password) {
      query = 'UPDATE users SET role_id = ?, eselon1_id = ?, eselon2_id = ?, nama = ?, nip = ?, email = ?, jabatan = ?, kontak = ?, password = ?, status_aktif = ? WHERE user_id = ?';
      params = [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, password, status_aktif, req.params.id];
    } else {
      query = 'UPDATE users SET role_id = ?, eselon1_id = ?, eselon2_id = ?, nama = ?, nip = ?, email = ?, jabatan = ?, kontak = ?, status_aktif = ? WHERE user_id = ?';
      params = [role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, kontak, status_aktif, req.params.id];
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

// Update profile (untuk operator mengupdate data sendiri)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nama, nip, email, jabatan, kontak } = req.body;
    
    // Validasi: pastikan field penting tidak kosong
    if (!nama || !email || !jabatan || !kontak) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, jabatan, dan kontak harus diisi'
      });
    }
    
    // Validasi: email harus berakhiran @kkp.go.id
    if (!email.endsWith('@kkp.go.id')) {
      return res.status(400).json({
        success: false,
        message: 'Email harus menggunakan domain @kkp.go.id'
      });
    }
    
    // Validasi: NIP harus 18 digit dan hanya angka (jika diisi)
    if (nip) {
      if (!/^\d{18}$/.test(nip)) {
        return res.status(400).json({
          success: false,
          message: 'NIP harus 18 digit dan hanya berisi angka'
        });
      }
    }
    
    // Update data profile tanpa mengubah role, eselon, dan password
    const query = 'UPDATE users SET nama = ?, nip = ?, email = ?, jabatan = ?, kontak = ? WHERE user_id = ?';
    const params = [nama, nip, email, jabatan, kontak, userId];
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Ambil data user yang sudah diupdate
    const [updatedUser] = await pool.query(`
      SELECT 
        u.user_id,
        u.nama,
        u.nip,
        u.email,
        u.jabatan,
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
    `, [userId]);
    
    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: updatedUser[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengupdate profile',
      error: error.message
    });
  }
};

// Change password (untuk operator mengubah password sendiri)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    // Validasi input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru harus diisi'
      });
    }
    
    // Validasi: password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)'
      });
    }
    
    // Cek password lama
    const [user] = await pool.query('SELECT password FROM users WHERE user_id = ?', [userId]);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Verifikasi password lama
    if (user[0].password !== oldPassword) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }
    
    // Update password
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [newPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengubah password',
      error: error.message
    });
  }
};
