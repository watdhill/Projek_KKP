const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    console.log('=== CHECKING environment in master_table_registry ===');
    const [reg] = await conn.query('SELECT * FROM master_table_registry WHERE table_name = ?', ['environment']);
    console.log('Found in registry:', reg.length > 0 ? 'YES' : 'NO');
    if (reg.length > 0) {
        console.log(JSON.stringify(reg[0], null, 2));
    }

    console.log('\n=== CHECKING environment_id in master_laporan_field ===');
    const [field] = await conn.query('SELECT * FROM master_laporan_field WHERE kode_field = ? OR nama_field LIKE ?', ['environment_id', '%kosistem%']);
    console.log('Found in laporan_field:', field.length);
    field.forEach(f => console.log(f));

    console.log('\n=== ALL dynamic master tables in registry ===');
    const [all] = await conn.query('SELECT table_name, display_name, status_aktif FROM master_table_registry ORDER BY display_name');
    all.forEach(t => console.log(`  ${t.table_name} (${t.display_name}) - ${t.status_aktif ? 'ACTIVE' : 'INACTIVE'}`));

    await conn.end();
}

check();
