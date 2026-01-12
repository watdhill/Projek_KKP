const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'projek_kkp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
pool.getConnection()
  .then(connection => {
    console.log('Database terhubung dengan sukses');
    connection.release();
  })
  .catch(err => {
    console.error('Error koneksi database:', err.message);
  });

module.exports = pool;
