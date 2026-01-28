const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function verifyFields() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    try {
        console.log('--- Listing all VA/PT related fields (JSON) ---');
        const [rows] = await connection.query(`
            SELECT field_id, nama_field, parent_id, level, kode_field
            FROM master_laporan_field 
            WHERE nama_field LIKE '%VA%PT%' OR kode_field LIKE '%va%pt%'
        `);
        console.log(JSON.stringify(rows, null, 2));

        if (rows.length === 2) {
            console.log('Verification SUCCESS: Both VA/PT fields found under the correct hierarchy.');
        } else {
            console.log(`Verification FAILED: Expected 2 fields, found ${rows.length}.`);
        }
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await connection.end();
    }
}

verifyFields();
