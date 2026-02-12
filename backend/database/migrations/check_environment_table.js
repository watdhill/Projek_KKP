const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function check() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    const [t] = await c.query('SHOW TABLES LIKE "environment"');
    console.log('Table environment exists:', t.length > 0 ? 'YES' : 'NO');
    
    if (t.length > 0) {
        const [s] = await c.query('DESCRIBE environment');
        console.log('Structure:');
        s.forEach(f => console.log(`  ${f.Field} (${f.Type})`));
        
        const [count] = await c.query('SELECT COUNT(*) as cnt FROM environment WHERE status_aktif = 1');
        console.log(`Active records: ${count[0].cnt}`);
    }

    await c.end();
}

check();
