const pool = require('../config/database');

// Table configuration to map type to database table, columns, and ID field
const tableConfig = {
  eselon1: {
    tableName: 'master_eselon1',
    idField: 'eselon1_id',
    columns: ['nama_eselon1', 'singkatan', 'status_aktif'],
    displayColumns: ['Nama Eselon 1', 'Singkatan', 'Status']
  },
  eselon2: {
    tableName: 'master_eselon2',
    idField: 'eselon2_id',
    columns: ['eselon1_id', 'nama_eselon2', 'status_aktif'],
    displayColumns: ['Eselon 1', 'Nama Eselon 2', 'Status']
  },
  frekuensi_pemakaian: {
    tableName: 'frekuensi_pemakaian',
    idField: 'frekuensi_pemakaian',
    columns: ['nama_frekuensi', 'status_aktif'],
    displayColumns: ['Nama Frekuensi', 'Status']
  },
  status_aplikasi: {
    tableName: 'status_aplikasi',
    idField: 'status_aplikasi_id',
    columns: ['nama_status', 'status_aktif'],
    displayColumns: ['Nama Status', 'Status']
  },
  environment: {
    tableName: 'environment',
    idField: 'environment_id',
    columns: ['jenis_environment', 'status_aktif'],
    displayColumns: ['Jenis Environment', 'Status']
  },
  cara_akses: {
    tableName: 'cara_akses',
    idField: 'cara_akses_id',
    columns: ['nama_cara_akses', 'status_aktif'],
    displayColumns: ['Nama Cara Akses', 'Status']
  },
  pdn: {
    tableName: 'PDN',
    idField: 'pdn_id',
    columns: ['kode_pdn', 'status_aktif'],
    displayColumns: ['Kode PDN', 'Status']
  },
  format_laporan: {
    tableName: 'format_laporan',
    idField: 'format_laporan_id',
    columns: ['nama_format', 'status_aktif', 'selected_fields'],
    displayColumns: ['Nama Format', 'Status', 'Field Terpilih']
  },
  pic_eksternal: {
    tableName: 'pic_eksternal',
    idField: 'pic_eksternal_id',
    columns: ['eselon2_id', 'nama_pic_eksternal', 'keterangan', 'kontak_pic_eksternal', 'status_aktif'],
    displayColumns: ['Nama PIC', 'Keterangan', 'Kontak', 'Status']
  },
  pic_internal: {
    tableName: 'pic_internal',
    idField: 'pic_internal_id',
    columns: ['eselon2_id', 'nama_pic_internal', 'kontak_pic_internal', 'status_aktif'],
    displayColumns: ['Eselon 2', 'Nama PIC', 'Kontak', 'Status']
  }
};

// ... (existing code)



// Get table config by type
const getConfig = (type) => {
  const config = tableConfig[type];
  if (!config) {
    throw new Error(`Tipe master data "${type}" tidak valid. Tipe yang tersedia: ${Object.keys(tableConfig).join(', ')}`);
  }
  return config;
};

// Get all master data by type
exports.getAllMasterData = async (req, res) => {
  try {
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);

    let query = `SELECT * FROM ${config.tableName}`;
    const params = [];

    // Filter by eselon2_id for PIC types if provided (for Operator Eselon 2 visibility)
    if ((type === 'pic_internal' || type === 'pic_eksternal') && req.query.eselon2_id) {
      query += ` WHERE eselon2_id = ?`;
      params.push(req.query.eselon2_id);
    }

    query += ` ORDER BY ${config.idField} DESC`;

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      type: type,
      columns: config.displayColumns,
      idField: config.idField,
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
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);

    const [rows] = await pool.query(`SELECT * FROM ${config.tableName} WHERE ${config.idField} = ?`, [req.params.id]);
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
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);

    console.log('=== CREATE MASTER DATA ===');
    console.log('Type:', type);
    console.log('Body:', req.body);

    // Validate eselon1_id exists for eselon2 type
    if (type === 'eselon2' && req.body.eselon1_id) {
      const [eselon1Check] = await pool.query(
        'SELECT eselon1_id FROM master_eselon1 WHERE eselon1_id = ?',
        [req.body.eselon1_id]
      );
      if (eselon1Check.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Eselon 1 dengan ID ${req.body.eselon1_id} tidak ditemukan di database`
        });
      }
    }

    // Check for duplicate names based on type
    const nameField = {
      eselon1: 'nama_eselon1',
      eselon2: 'nama_eselon2',
      frekuensi_pemakaian: 'nama_frekuensi',
      status_aplikasi: 'nama_status',
      environment: 'jenis_environment',
      cara_akses: 'nama_cara_akses',
      pdn: 'kode_pdn',
      format_laporan: 'nama_format',
      pic_eksternal: 'nama_pic_eksternal',
      pic_internal: 'nama_pic_internal'
    };

    // Validate eselon2_id exists for pic types
    if (type === 'pic_internal' && req.body.eselon2_id) {
      const [eselon2Check] = await pool.query(
        'SELECT eselon2_id FROM master_eselon2 WHERE eselon2_id = ?',
        [req.body.eselon2_id]
      );
      if (eselon2Check.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Eselon 2 dengan ID ${req.body.eselon2_id} tidak ditemukan di database`
        });
      }
    }

    if (nameField[type] && req.body[nameField[type]]) {
      const [duplicateCheck] = await pool.query(
        `SELECT ${config.idField} FROM ${config.tableName} WHERE ${nameField[type]} = ?`,
        [req.body[nameField[type]]]
      );
      if (duplicateCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Data dengan nama "${req.body[nameField[type]]}" sudah ada. Tidak boleh duplikat.`
        });
      }
    }

    // Build dynamic insert query based on provided fields
    const fields = [];
    const values = [];
    const placeholders = [];

    for (const col of config.columns) {
      if (req.body[col] !== undefined) {
        fields.push(col);
        let val = req.body[col];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
        placeholders.push('?');
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada field yang diberikan untuk insert'
      });
    }

    const sql = `INSERT INTO ${config.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log('SQL:', sql);
    console.log('Values:', values);

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      success: true,
      message: 'Master data berhasil ditambahkan',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('=== ERROR CREATE MASTER DATA ===');
    console.error('Error:', error);

    // Provide more detailed error message
    let errorMessage = 'Error memperbarui master data';
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
      errorMessage = 'Data yang dipilih tidak valid atau tidak ditemukan di tabel referensi (Foreign Key Error)';
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Data sudah ada (duplikat)';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      sqlCode: error.code
    });
  }
};

// Update master data
exports.updateMasterData = async (req, res) => {
  try {
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);

    // Build dynamic update query
    const updates = [];
    const values = [];

    for (const col of config.columns) {
      if (req.body[col] !== undefined) {
        updates.push(`${col} = ?`);
        let val = req.body[col];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada field yang diberikan untuk update'
      });
    }

    values.push(req.params.id);
    const sql = `UPDATE ${config.tableName} SET ${updates.join(', ')} WHERE ${config.idField} = ?`;
    const [result] = await pool.query(sql, values);

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

// Toggle status (Aktifkan/Nonaktifkan)
exports.toggleStatus = async (req, res) => {
  try {
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);
    const { status_aktif } = req.body;

    // Check if table has status_aktif column
    if (!config.columns.includes('status_aktif')) {
      return res.status(400).json({
        success: false,
        message: 'Tipe master data ini tidak mendukung toggle status'
      });
    }

    const sql = `UPDATE ${config.tableName} SET status_aktif = ? WHERE ${config.idField} = ?`;
    const [result] = await pool.query(sql, [status_aktif, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master data tidak ditemukan'
      });
    }
    res.json({
      success: true,
      message: `Status berhasil diubah menjadi ${status_aktif ? 'Aktif' : 'Nonaktif'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengubah status',
      error: error.message
    });
  }
};

// Delete master data
exports.deleteMasterData = async (req, res) => {
  try {
    const type = req.query.type || 'eselon1';
    const config = getConfig(type);

    const [result] = await pool.query(`DELETE FROM ${config.tableName} WHERE ${config.idField} = ?`, [req.params.id]);
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

// Get available types and their metadata
exports.getTypes = async (req, res) => {
  try {
    const types = Object.keys(tableConfig).map(key => ({
      value: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      columns: tableConfig[key].columns,
      displayColumns: tableConfig[key].displayColumns
    }));
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil tipe master data',
      error: error.message
    });
  }
};

// Get dropdown data untuk form pengguna
exports.getDropdownData = async (req, res) => {
  try {
    const { eselon1_id } = req.query;
    console.log('=== GET DROPDOWN DATA ===');
    console.log('Query Params:', req.query);
    console.log('Eselon 1 ID requested:', eselon1_id);

    const [roles] = await pool.query('SELECT * FROM roles ORDER BY role_id');
    const [eselon1] = await pool.query('SELECT * FROM master_eselon1 WHERE status_aktif = 1 ORDER BY nama_eselon1');

    let eselon2Query = 'SELECT * FROM master_eselon2 WHERE status_aktif = 1';
    const eselon2Params = [];

    if (eselon1_id) {
      eselon2Query += ' AND eselon1_id = ?';
      eselon2Params.push(eselon1_id);
    }

    eselon2Query += ' ORDER BY nama_eselon2';

    const [eselon2] = await pool.query(eselon2Query, eselon2Params);

    // Fetch all master data needed for form dropdowns
    const [cara_akses] = await pool.query('SELECT * FROM cara_akses WHERE status_aktif = 1 ORDER BY nama_cara_akses');
    const [frekuensi_pemakaian] = await pool.query('SELECT * FROM frekuensi_pemakaian WHERE status_aktif = 1 ORDER BY nama_frekuensi');
    const [status_aplikasi] = await pool.query('SELECT * FROM status_aplikasi ORDER BY nama_status');
    const [pdn] = await pool.query('SELECT * FROM pdn WHERE status_aktif = 1 ORDER BY kode_pdn');
    const [environment] = await pool.query('SELECT * FROM environment WHERE status_aktif = 1 ORDER BY jenis_environment');
    const [pic_internal] = await pool.query('SELECT * FROM pic_internal WHERE status_aktif = 1 ORDER BY nama_pic_internal');
    const [pic_eksternal] = await pool.query('SELECT * FROM pic_eksternal WHERE status_aktif = 1 ORDER BY nama_pic_eksternal');

    res.json({
      success: true,
      data: {
        roles,
        eselon1,
        eselon2,
        cara_akses,
        frekuensi_pemakaian,
        status_aplikasi,
        pdn,
        environment,
        pic_internal,
        pic_eksternal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data dropdown',
      error: error.message
    });
  }
};

