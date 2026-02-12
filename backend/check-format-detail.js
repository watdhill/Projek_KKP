const pool = require('./src/config/database');

async function checkStructure() {
  try {
    const [cols] = await pool.query('DESCRIBE format_laporan_detail');
    console.log('\n=== format_laporan_detail columns ===');
    cols.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStructure();
