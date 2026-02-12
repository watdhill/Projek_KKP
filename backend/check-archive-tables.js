const pool = require('./src/config/database');

async function checkTables() {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE '%archive%'");
    console.log('\n=== Archive Tables ===');
    console.log(tables);
    
    if (tables.length > 0) {
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\n=== Structure of ${tableName} ===`);
        const [columns] = await pool.query(`DESCRIBE ${tableName}`);
        console.log(columns);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
