const mysql = require('mysql2/promise');

// This script will reorder existing format_laporan_detail records
// to ensure proper ordering: fields with same judul grouped together,
// and individual fields maintain their relative order

async function reorderFormatFields() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kkp_db'
    });

    try {
        // Get all format_laporan_id
        const [formats] = await connection.query(
            'SELECT DISTINCT format_laporan_id FROM format_laporan_detail ORDER BY format_laporan_id'
        );

        for (const format of formats) {
            const formatId = format.format_laporan_id;
            console.log(`\nProcessing format_laporan_id: ${formatId}`);

            // Get all fields for this format, ordered by current order_index
            const [fields] = await connection.query(`
        SELECT 
          fld.id,
          fld.field_id,
          fld.judul,
          fld.is_header,
          fld.order_index,
          mlf.nama_field
        FROM format_laporan_detail fld
        LEFT JOIN master_laporan_field mlf ON fld.field_id = mlf.field_id
        WHERE fld.format_laporan_id = ?
        ORDER BY fld.order_index ASC, fld.id ASC
      `, [formatId]);

            // Group fields by judul
            const groups = {};
            const noJudulFields = [];

            fields.forEach(field => {
                if (field.judul && field.judul.trim() !== '') {
                    if (!groups[field.judul]) {
                        groups[field.judul] = [];
                    }
                    groups[field.judul].push(field);
                } else {
                    noJudulFields.push(field);
                }
            });

            // Reorder: maintain relative position of first field in each group or individual field
            const reordered = [];
            const processedJuduls = new Set();

            fields.forEach(field => {
                if (field.judul && field.judul.trim() !== '' && !processedJuduls.has(field.judul)) {
                    // Add all fields with this judul
                    reordered.push(...groups[field.judul]);
                    processedJuduls.add(field.judul);
                } else if (!field.judul || field.judul.trim() === '') {
                    // Add individual field
                    reordered.push(field);
                }
            });

            // Update order_index
            for (let i = 0; i < reordered.length; i++) {
                await connection.query(
                    'UPDATE format_laporan_detail SET order_index = ? WHERE id = ?',
                    [i + 1, reordered[i].id]
                );
            }

            console.log(`✓ Reordered ${reordered.length} fields`);
        }

        console.log('\n✓ All formats reordered successfully');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

reorderFormatFields();
