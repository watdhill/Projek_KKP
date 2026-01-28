const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function listFields() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    try {
        console.log('--- Listing all fields containing \"VA\" and \"PT\" ---');
        const [rows] = await connection.query('SELECT field_id, nama_field, parent_id, level, kode_field FROM master_laporan_field WHERE nama_field LIKE \"%VA%PT%\"');

        rows.forEach(r => {
            console.log(`ID: ${r.field_id} | Level: ${r.level} | Parent: ${r.parent_id || 'NULL'} | Name: [${r.nama_field}] | Code: ${r.kode_field || 'NULL'}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

listFields();
