const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAuditLogTable() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kkp_db',
    });

    console.log('Connected to database...');

    // Drop table if exists (optional - comment out if you want to keep existing data)
    // await connection.query('DROP TABLE IF EXISTS audit_log');
    // console.log('Dropped existing audit_log table (if existed)');

    // Create audit_log table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        table_name VARCHAR(100),
        action VARCHAR(50) COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT',
        record_id INT,
        old_values JSON,
        new_values JSON,
        changes JSON,
        detail TEXT,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        aksi VARCHAR(100) COMMENT 'Deprecated: use action instead',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_table_name (table_name),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.query(createTableSQL);
    console.log('✅ Table audit_log created successfully!');

    // Add table comment
    await connection.query(
      "ALTER TABLE audit_log COMMENT = 'Stores all system activity logs for audit purposes'"
    );
    console.log('✅ Table comment added successfully!');

    // Show table structure
    const [columns] = await connection.query('DESCRIBE audit_log');
    console.log('\n📋 Table Structure:');
    console.table(columns);

    console.log('\n✨ Setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // If foreign key error, try without foreign key
    if (error.message.includes('foreign key')) {
      console.log('\n⚠️  Foreign key constraint failed. Creating table without foreign key...');
      
      try {
        const createTableWithoutFK = `
          CREATE TABLE IF NOT EXISTS audit_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            table_name VARCHAR(100),
            action VARCHAR(50) COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT',
            record_id INT,
            old_values JSON,
            new_values JSON,
            changes JSON,
            detail TEXT,
            description TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            aksi VARCHAR(100) COMMENT 'Deprecated: use action instead',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_table_name (table_name),
            INDEX idx_action (action),
            INDEX idx_created_at (created_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.query(createTableWithoutFK);
        console.log('✅ Table audit_log created successfully (without foreign key)!');
        
        const [columns] = await connection.query('DESCRIBE audit_log');
        console.log('\n📋 Table Structure:');
        console.table(columns);
        
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the function
createAuditLogTable();
