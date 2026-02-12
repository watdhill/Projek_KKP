const mysql = require('mysql2/promise');

async function addOrderIndexColumn() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kkp_db'
    });

    try {
        // Check if column exists
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM format_laporan_detail LIKE 'order_index'"
        );

        if (columns.length === 0) {
            console.log('Adding order_index column...');

            // Add column
            await connection.query(`
        ALTER TABLE format_laporan_detail 
        ADD COLUMN order_index INT DEFAULT 0 AFTER field_id
      `);

            console.log('✓ Column added successfully');

            // Update existing records with sequential order
            console.log('Updating existing records...');

            const [formats] = await connection.query(
                'SELECT DISTINCT format_laporan_id FROM format_laporan_detail ORDER BY format_laporan_id'
            );

            for (const format of formats) {
                const [details] = await connection.query(
                    'SELECT id FROM format_laporan_detail WHERE format_laporan_id = ? ORDER BY id',
                    [format.format_laporan_id]
                );

                for (let i = 0; i < details.length; i++) {
                    await connection.query(
                        'UPDATE format_laporan_detail SET order_index = ? WHERE id = ?',
                        [i + 1, details[i].id]
                    );
                }
            }

            console.log('✓ Existing records updated');

            // Add index
            await connection.query(`
        CREATE INDEX idx_format_order 
        ON format_laporan_detail(format_laporan_id, order_index)
      `);

            console.log('✓ Index created');
        } else {
            console.log('Column order_index already exists');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

addOrderIndexColumn();
