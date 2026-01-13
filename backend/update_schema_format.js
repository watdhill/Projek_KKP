const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:\\Users\\Asus\\Projek_KKP\\backend\\.env' });

async function updateFormatLaporanSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Check columns
        const [columns] = await connection.query('SHOW COLUMNS FROM format_laporan');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames);

        // Add selected_fields if missing
        if (!columnNames.includes('selected_fields')) {
            console.log('Adding selected_fields column...');
            await connection.query('ALTER TABLE format_laporan ADD COLUMN selected_fields TEXT');
            console.log('Column selected_fields added.');
        } else {
            console.log('Column selected_fields already exists.');
        }

        // Remove nama_aplikasi if exists (since user said it's not needed)
        if (columnNames.includes('nama_aplikasi')) {
            console.log('Dropping nama_aplikasi column...');
            // await connection.query('ALTER TABLE format_laporan DROP COLUMN nama_aplikasi'); // Commented out for safety, maybe just ignore it
            console.log('Skipping drop of nama_aplikasi for safety, just ignoring it.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

updateFormatLaporanSchema();
