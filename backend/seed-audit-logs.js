const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kkp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function seedAuditLogs() {
  const pool = mysql.createPool(config);
  
  try {
    console.log('Inserting test audit log entries...');
    
    const insertQuery = `
      INSERT INTO audit_log 
      (user_id, table_name, action, record_id, old_values, new_values, changes, ip_address, user_agent, detail, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const testEntries = [
      [1, 'users', 'LOGIN', null, null, null, null, '127.0.0.1', 'Mozilla/5.0', null, null],
      [1, 'data_aplikasi', 'CREATE', 1, null, null, null, '192.168.1.1', 'Chrome', 'New application created', 'Admin created new app'],
      [2, 'data_aplikasi', 'UPDATE', 1, null, null, null, '192.168.1.5', 'Firefox', 'Application status updated', 'User updated app status'],
      [1, 'master_eselon1', 'DELETE', 5, null, null, null, '127.0.0.1', 'Safari', 'Master eselon1 deleted', 'Admin deleted unused eselon'],
    ];
    
    for (const entry of testEntries) {
      await pool.query(insertQuery, entry);
    }
    
    console.log('✓ Test audit log entries created successfully!');
    
    // Verify
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM audit_log');
    console.log(`Total audit log entries: ${rows[0].total}`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await pool.end();
  }
}

seedAuditLogs();
