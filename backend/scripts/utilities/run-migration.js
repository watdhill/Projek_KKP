const pool = require('./src/config/database');

async function runMigration() {
    try {
        console.log('=== Running Database Migration ===\n');

        const connection = await pool.getConnection();

        try {
            // 1. Add parent_id column
            console.log('1. Adding parent_id column...');
            await connection.query(`
        ALTER TABLE format_laporan_detail
        ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER format_laporan_id
      `);
            console.log('✓ Success\n');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Column parent_id already exists\n');
            } else {
                throw error;
            }
        }

        try {
            // 2. Add judul column
            console.log('2. Adding judul column...');
            await connection.query(`
        ALTER TABLE format_laporan_detail
        ADD COLUMN judul VARCHAR(200) NULL AFTER parent_id
      `);
            console.log('✓ Success\n');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Column judul already exists\n');
            } else {
                throw error;
            }
        }

        try {
            // 3. Add is_header column
            console.log('3. Adding is_header column...');
            await connection.query(`
        ALTER TABLE format_laporan_detail
        ADD COLUMN is_header TINYINT(1) DEFAULT 0 AFTER judul
      `);
            console.log('✓ Success\n');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Column is_header already exists\n');
            } else {
                throw error;
            }
        }

        try {
            // 4. Add foreign key for parent_id
            console.log('4. Adding foreign key constraint...');
            await connection.query(`
        ALTER TABLE format_laporan_detail
        ADD CONSTRAINT fk_parent_detail
        FOREIGN KEY (parent_id) REFERENCES format_laporan_detail(detail_id) ON DELETE CASCADE
      `);
            console.log('✓ Success\n');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('⚠ Foreign key already exists\n');
            } else {
                console.log('⚠ Foreign key creation failed (may already exist):', error.message, '\n');
            }
        }

        // 5. Update existing data
        console.log('5. Updating existing data...');
        await connection.query(`
      UPDATE format_laporan_detail 
      SET judul = label_tampilan 
      WHERE judul IS NULL
    `);
        console.log('✓ Success\n');

        connection.release();

        console.log('=== Migration Completed Successfully ===\n');

        // Verify new structure
        console.log('Verifying new structure:');
        const [columns] = await pool.query('DESCRIBE format_laporan_detail');
        console.table(columns);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
