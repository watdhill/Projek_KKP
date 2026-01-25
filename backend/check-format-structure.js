const pool = require('./src/config/database');

async function checkFormatLaporanStructure() {
    try {
        console.log('=== Checking format_laporan structure ===\n');

        // 1. Get all format laporan
        const [formats] = await pool.query('SELECT * FROM format_laporan ORDER BY format_laporan_id');
        console.log('Available Formats:');
        console.table(formats);

        // 2. Get format_laporan_detail for first format
        if (formats.length > 0) {
            const formatId = formats[0].format_laporan_id;
            console.log(`\n=== Details for Format: ${formats[0].nama_format} ===`);

            const [details] = await pool.query(`
        SELECT 
          detail_id,
          format_laporan_id,
          parent_id,
          judul,
          field_name,
          urutan
        FROM format_laporan_detail
        WHERE format_laporan_id = ?
        ORDER BY urutan
      `, [formatId]);

            console.table(details);

            // 3. Build hierarchy
            console.log('\n=== Hierarchical Structure ===');
            const buildTree = (items, parentId = null, level = 0) => {
                items
                    .filter(item => item.parent_id === parentId)
                    .forEach(item => {
                        console.log('  '.repeat(level) + `├─ ${item.judul} (field: ${item.field_name || 'N/A'})`);
                        buildTree(items, item.detail_id, level + 1);
                    });
            };
            buildTree(details);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFormatLaporanStructure();
