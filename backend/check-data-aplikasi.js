const pool = require('./src/config/database');

async function checkDataAplikasiStructure() {
  try {
    console.log('\n=== data_aplikasi columns ===');
    const [cols] = await pool.query('DESCRIBE data_aplikasi');
    cols.forEach(c => console.log(`  - ${c.Field} (${c.Type}) ${c.Key === 'PRI' ? '← PRIMARY KEY' : ''}`));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDataAplikasiStructure();
