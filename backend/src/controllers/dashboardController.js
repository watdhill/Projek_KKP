const pool = require('../config/database');

// Get statistics for dashboard - 4 cards
exports.getStatistics = async (req, res) => {
  try {
    const queries = [
      // Aplikasi Aktif (status_aplikasi_id = 2)
      'SELECT COUNT(*) as total FROM data_aplikasi WHERE status_aplikasi = 2',
      // Aplikasi Tidak Aktif (status_aplikasi_id = 3)
      'SELECT COUNT(*) as total FROM data_aplikasi WHERE status_aplikasi = 3',
      // Aplikasi Dalam Pengembangan (status_aplikasi_id = 6)
      'SELECT COUNT(*) as total FROM data_aplikasi WHERE status_aplikasi = 6',
      // Total Aplikasi
      'SELECT COUNT(*) as total FROM data_aplikasi'
    ];

    const results = await Promise.all(
      queries.map(query => pool.query(query))
    );

    res.json({
      success: true,
      data: {
        aplikasiAktif: results[0][0][0].total,
        aplikasiTidakAktif: results[1][0][0].total,
        aplikasiDalamPengembangan: results[2][0][0].total,
        totalAplikasi: results[3][0][0].total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil statistik dashboard',
      error: error.message
    });
  }
};

// Get eselon1 chart data - jumlah aplikasi per unit
exports.getEselon1Chart = async (req, res) => {
  try {
    const query = `
      SELECT 
        e1.nama_eselon1,
        e1.singkatan,
        e1.no,
        COUNT(CASE WHEN da.status_aplikasi = 2 THEN 1 END) as aktif,
        COUNT(CASE WHEN da.status_aplikasi = 3 THEN 1 END) as tidak_aktif,
        COUNT(CASE WHEN da.status_aplikasi = 6 THEN 1 END) as dalam_pengembangan,
        COUNT(da.nama_aplikasi) as total
      FROM master_eselon1 e1
      LEFT JOIN data_aplikasi da ON e1.eselon1_id = da.eselon1_id
      WHERE e1.status_aktif = 1
      GROUP BY e1.eselon1_id, e1.nama_eselon1, e1.singkatan, e1.no
      ORDER BY e1.no ASC
    `;

    const [rows] = await pool.query(query);

    // Debug log
    console.log('=== Chart Data (Fixed) ===');
    rows.forEach(row => {
      if (row.total > 0) {
        console.log(`${row.singkatan}: total=${row.total}, aktif=${row.aktif}, tidak_aktif=${row.tidak_aktif}, dalam_pengembangan=${row.dalam_pengembangan}`);
      }
    });

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data chart eselon1',
      error: error.message
    });
  }
};

// Get recent application updates
exports.getRecentUpdates = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const query = `
      SELECT 
        da.nama_aplikasi,
        da.domain,
        sa.nama_status,
        e1.nama_eselon1,
        e1.singkatan as singkatan_eselon1,
        e2.nama_eselon2,
        da.updated_at,
        da.created_at
      FROM data_aplikasi da
      LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
      ORDER BY COALESCE(da.updated_at, da.created_at) DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(query, [parseInt(limit)]);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data update aplikasi',
      error: error.message
    });
  }
};

// ==================== OPERATOR DASHBOARD ENDPOINTS ====================

// Get statistics for operator dashboard - filtered by eselon level
exports.getOperatorStatistics = async (req, res) => {
  try {
    const { eselon1_id, eselon2_id, upt_id } = req.query;

    // Build WHERE clause based on operator level
    let whereClause = '';
    const params = [];

    if (upt_id) {
      whereClause = 'WHERE da.upt_id = ?';
      params.push(upt_id);
    } else if (eselon2_id) {
      whereClause = 'WHERE da.eselon2_id = ?';
      params.push(eselon2_id);
    } else if (eselon1_id) {
      whereClause = 'WHERE da.eselon1_id = ?';
      params.push(eselon1_id);
    }

    const queries = [
      // Aplikasi Aktif (status_aplikasi_id = 2)
      `SELECT COUNT(*) as total FROM data_aplikasi da ${whereClause} AND da.status_aplikasi = 2`,
      // Aplikasi Tidak Aktif (status_aplikasi_id = 3)
      `SELECT COUNT(*) as total FROM data_aplikasi da ${whereClause} AND da.status_aplikasi = 3`,
      // Aplikasi Dalam Pengembangan (status_aplikasi_id = 6)
      `SELECT COUNT(*) as total FROM data_aplikasi da ${whereClause} AND da.status_aplikasi = 6`,
      // Total Aplikasi
      `SELECT COUNT(*) as total FROM data_aplikasi da ${whereClause}`
    ];

    const results = await Promise.all(
      queries.map(query => pool.query(query, params))
    );

    res.json({
      success: true,
      data: {
        aplikasiAktif: results[0][0][0].total,
        aplikasiTidakAktif: results[1][0][0].total,
        aplikasiDalamPengembangan: results[2][0][0].total,
        totalAplikasi: results[3][0][0].total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil statistik dashboard operator',
      error: error.message
    });
  }
};

// Get chart data for operator dashboard - shows sub-units
exports.getOperatorChart = async (req, res) => {
  try {
    const { eselon1_id, eselon2_id } = req.query;

    let query = '';
    let params = [];

    if (eselon1_id) {
      // For Eselon1 operator: show Eselon2 breakdown
      query = `
        SELECT 
          e2.nama_eselon2 as nama,
          COUNT(CASE WHEN da.status_aplikasi = 2 THEN 1 END) as aktif,
          COUNT(CASE WHEN da.status_aplikasi = 3 THEN 1 END) as tidak_aktif,
          COUNT(CASE WHEN da.status_aplikasi = 6 THEN 1 END) as dalam_pengembangan,
          COUNT(da.nama_aplikasi) as total
        FROM master_eselon2 e2
        LEFT JOIN data_aplikasi da ON e2.eselon2_id = da.eselon2_id AND da.eselon1_id = ?
        WHERE e2.eselon1_id = ? AND e2.status_aktif = 1
        GROUP BY e2.eselon2_id, e2.nama_eselon2
        ORDER BY e2.nama_eselon2 ASC
      `;
      params = [eselon1_id, eselon1_id];
    } else if (eselon2_id) {
      // For Eselon2 operator: show UPT breakdown (if UPT table exists)
      // For now, show application breakdown by status
      query = `
        SELECT 
          sa.nama_status as nama,
          sa.nama_status as singkatan,
          sa.status_aplikasi_id as no,
          COUNT(CASE WHEN sa.status_aplikasi_id = 2 THEN 1 END) as aktif,
          COUNT(CASE WHEN sa.status_aplikasi_id = 3 THEN 1 END) as tidak_aktif,
          COUNT(CASE WHEN sa.status_aplikasi_id = 6 THEN 1 END) as dalam_pengembangan,
          COUNT(da.nama_aplikasi) as total
        FROM status_aplikasi sa
        LEFT JOIN data_aplikasi da ON sa.status_aplikasi_id = da.status_aplikasi AND da.eselon2_id = ?
        WHERE sa.status_aktif = 1
        GROUP BY sa.status_aplikasi_id, sa.nama_status
        ORDER BY sa.status_aplikasi_id ASC
      `;
      params = [eselon2_id];
    } else {
      // No filter - return empty
      return res.json({
        success: true,
        data: []
      });
    }

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data chart operator',
      error: error.message
    });
  }
};

// Get recent updates for operator dashboard - filtered by eselon level
exports.getOperatorRecentUpdates = async (req, res) => {
  try {
    const { eselon1_id, eselon2_id, upt_id, limit = 10 } = req.query;

    // Build WHERE clause based on operator level
    let whereClause = '';
    const params = [];

    if (upt_id) {
      whereClause = 'WHERE da.upt_id = ?';
      params.push(upt_id);
    } else if (eselon2_id) {
      whereClause = 'WHERE da.eselon2_id = ?';
      params.push(eselon2_id);
    } else if (eselon1_id) {
      whereClause = 'WHERE da.eselon1_id = ?';
      params.push(eselon1_id);
    }

    const query = `
      SELECT 
        da.nama_aplikasi,
        da.domain,
        sa.nama_status,
        e1.nama_eselon1,
        e1.singkatan as singkatan_eselon1,
        e2.nama_eselon2,
        da.updated_at,
        da.created_at
      FROM data_aplikasi da
      LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
      ${whereClause}
      ORDER BY COALESCE(da.updated_at, da.created_at) DESC
      LIMIT ?
    `;

    params.push(parseInt(limit));

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error mengambil data update aplikasi operator',
      error: error.message
    });
  }
};
