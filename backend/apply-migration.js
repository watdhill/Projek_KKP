const pool = require('./src/config/database');

async function runMigration() {
    try {
        console.log('Adding order_index column...');
        try {
            await pool.query("ALTER TABLE format_laporan_detail ADD COLUMN order_index INT DEFAULT 0 AFTER field_id");
            console.log('Column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column order_index already exists.');
            } else {
                throw err;
            }
        }

        console.log('Updating existing records...');
        await pool.query("SET @row_number = 0");
        await pool.query(`
      UPDATE format_laporan_detail 
      SET order_index = (@row_number:=@row_number + 1)
      ORDER BY format_laporan_id, id
    `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
