const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function addEnvironment() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    console.log('Adding Ekosistem (environment_id) to master_laporan_field...');

    try {
        // Check if already exists
        const [existing] = await connection.query(
            'SELECT field_id FROM master_laporan_field WHERE kode_field = ?',
            ['environment_id']
        );

        if (existing.length > 0) {
            console.log('  SKIP: environment_id already exists.');
        } else {
            // Insert as flat Level 3 field
            await connection.query(
                `INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan, is_active) 
                 VALUES (?, ?, NULL, 3, ?, 1)`,
                ['Ekosistem', 'environment_id', 24]
            );
            console.log('  ✓ ADDED: Ekosistem (environment_id)');
        }

        // Re-sort all flat fields to ensure proper ordering
        console.log('\nRe-sorting flat fields...');
        const [flatFields] = await connection.query(
            'SELECT field_id FROM master_laporan_field WHERE parent_id IS NULL AND level = 3 ORDER BY urutan, field_id'
        );
        
        for (let i = 0; i < flatFields.length; i++) {
            await connection.query(
                'UPDATE master_laporan_field SET urutan = ? WHERE field_id = ?',
                [i + 1, flatFields[i].field_id]
            );
        }
        console.log(`  ✓ Updated urutan for ${flatFields.length} flat fields.`);

        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

addEnvironment();
