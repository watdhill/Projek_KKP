const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function addVaPtFields() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    console.log('Connected to database.');

    try {
        // 1. Find Arsitektur Keamanan ID (Level 1)
        const [keamanan] = await connection.query(
            'SELECT field_id FROM master_laporan_field WHERE nama_field = ? AND level = 1',
            ['Arsitektur Keamanan']
        );

        if (keamanan.length === 0) {
            console.error('Arsitektur Keamanan not found!');
            return;
        }
        const keamananId = keamanan[0].field_id;

        // 2. Renaming existing 'Format Laporan VA/PT' to 'VA/PT' if it exists
        await connection.query(
            'UPDATE master_laporan_field SET nama_field = ? WHERE nama_field = ? AND parent_id = ?',
            ['VA/PT', 'Format Laporan VA/PT', keamananId]
        );

        // 3. Find or Insert VA/PT (Level 2)
        const [existingLvl2] = await connection.query(
            'SELECT field_id FROM master_laporan_field WHERE nama_field = ? AND parent_id = ?',
            ['VA/PT', keamananId]
        );

        let vaPtId;
        if (existingLvl2.length === 0) {
            console.log('Inserting VA/PT (Level 2)...');
            const [vaPt] = await connection.query(
                'INSERT INTO master_laporan_field (nama_field, parent_id, level, urutan) VALUES (?, ?, ?, ?)',
                ['VA/PT', keamananId, 2, 2]
            );
            vaPtId = vaPt.insertId;
        } else {
            console.log('VA/PT (Level 2) exists.');
            vaPtId = existingLvl2[0].field_id;
        }

        // 4. Update Level 3 labels if they exist with the codes
        const leafFields = [
            { nama: 'VA/PT', kode: 'va_pt_status', urutan: 1 },
            { nama: 'VA/PT - Waktu', kode: 'va_pt_waktu', urutan: 2 }
        ];

        for (const field of leafFields) {
            const [existingLvl3] = await connection.query(
                'SELECT field_id FROM master_laporan_field WHERE kode_field = ? AND parent_id = ?',
                [field.kode, vaPtId]
            );

            if (existingLvl3.length === 0) {
                console.log(`Inserting ${field.nama} (Level 3)...`);
                await connection.query(
                    'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
                    [field.nama, field.kode, vaPtId, 3, field.urutan]
                );
            } else {
                console.log(`Updating label for ${field.kode} to ${field.nama}...`);
                await connection.query(
                    'UPDATE master_laporan_field SET nama_field = ? WHERE field_id = ?',
                    [field.nama, existingLvl3[0].field_id]
                );
            }
        }

        console.log('VA/PT fields added successfully.');
    } catch (error) {
        console.error('Error during update:', error);
    } finally {
        await connection.end();
    }
}

addVaPtFields();
