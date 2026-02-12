const pool = require('./src/config/database');

async function checkSchema() {
  try {
    console.log('\n=== format_laporan structure ===');
    const [formatCols] = await pool.query('DESCRIBE format_laporan');
    formatCols.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    
    console.log('\n=== users structure ===');
    const [userCols] = await pool.query('DESCRIBE users');
    userCols.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
