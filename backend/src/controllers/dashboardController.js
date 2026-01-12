const pool = require('../config/database');

// Get statistics for dashboard
exports.getStatistics = async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as total FROM users WHERE status_aktif = 1',
      'SELECT COUNT(*) as total FROM data_aplikasi WHERE status_aplikasi = 1',
      'SELECT COUNT(*) as total FROM format_laporan WHERE status_aktif = 1',
      'SELECT COUNT(*) as total FROM master_eselon1 WHERE status_aktif = 1'
    ];

    const results = await Promise.all(
      queries.map(query => pool.query(query))
    );

    res.json({
      success: true,
      data: {
        totalUsers: results[0][0][0].total,
        totalAplikasi: results[1][0][0].total,
        totalLaporan: results[2][0][0].total,
        totalEselon: results[3][0][0].total
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
