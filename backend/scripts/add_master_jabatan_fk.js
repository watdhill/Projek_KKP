const mysql = require('mysql2/promise');
require('dotenv').config();

async function addMasterJabatanRelations() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    try {
        console.log('Adding FK constraints to master_jabatan table...\n');

        // Check current table structure
        const [columns] = await connection.query('SHOW COLUMNS FROM master_jabatan');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames.join(', '));
        console.log('');

        // Add frekuensi_pemakaian_id if not exists
        if (!columnNames.includes('frekuensi_pemakaian_id')) {
            console.log('Adding frekuensi_pemakaian_id column...');
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD COLUMN frekuensi_pemakaian_id BIGINT UNSIGNED NULL
        COMMENT 'Relasi ke frekuensi pemakaian'
        AFTER nama_jabatan
      `);
            console.log('✓ Column added');
        } else {
            console.log('- frekuensi_pemakaian_id already exists');
        }

        // Add eselon1_id if not exists
        if (!columnNames.includes('eselon1_id')) {
            console.log('Adding eselon1_id column...');
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD COLUMN eselon1_id BIGINT UNSIGNED NULL
        COMMENT 'Relasi ke eselon 1'
        AFTER frekuensi_pemakaian_id
      `);
            console.log('✓ Column added');
        } else {
            console.log('- eselon1_id already exists');
        }

        // Add format_laporan_id if not exists
        if (!columnNames.includes('format_laporan_id')) {
            console.log('Adding format_laporan_id column...');
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD COLUMN format_laporan_id INT NULL
        COMMENT 'Relasi ke format laporan'
        AFTER eselon1_id
      `);
            console.log('✓ Column added');
        } else {
            console.log('- format_laporan_id already exists');
        }

        console.log('\nAdding FK constraints...\n');

        // Add FK to frekuensi_pemakaian
        try {
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD CONSTRAINT fk_master_jabatan_frekuensi_pemakaian
        FOREIGN KEY (frekuensi_pemakaian_id)
        REFERENCES frekuensi_pemakaian(frekuensi_pemakaian)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `);
            console.log('✓ FK to frekuensi_pemakaian added');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('- FK to frekuensi_pemakaian already exists');
            } else {
                console.error('✗ Error adding FK to frekuensi_pemakaian:', err.message);
            }
        }

        // Add FK to master_eselon1
        try {
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD CONSTRAINT fk_master_jabatan_eselon1
        FOREIGN KEY (eselon1_id)
        REFERENCES master_eselon1(eselon1_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `);
            console.log('✓ FK to master_eselon1 added');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('- FK to master_eselon1 already exists');
            } else {
                console.error('✗ Error adding FK to master_eselon1:', err.message);
            }
        }

        // Add FK to format_laporan
        try {
            await connection.query(`
        ALTER TABLE master_jabatan
        ADD CONSTRAINT fk_master_jabatan_format_laporan
        FOREIGN KEY (format_laporan_id)
        REFERENCES format_laporan(format_laporan_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `);
            console.log('✓ FK to format_laporan added');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('- FK to format_laporan already exists');
            } else {
                console.error('✗ Error adding FK to format_laporan:', err.message);
            }
        }

        console.log('\n✅ All FK constraints added successfully!');

        // Show final table structure
        console.log('\n=== Final Table Structure ===');
        const [finalCreate] = await connection.query('SHOW CREATE TABLE master_jabatan');
        console.log(finalCreate[0]['Create Table']);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

addMasterJabatanRelations()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
