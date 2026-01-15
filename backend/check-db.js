const pool = require('./src/config/database');

async function checkSchema() {
    try {
        const tables = [
            'master_eselon1',
            'master_eselon2',
            'users',
            'cara_akses',
            'frekuensi_pemakaian',
            'status_aplikasi',
            'pdn',
            'environment',
            'pic_internal',
            'pic_eksternal',
            'data_aplikasi'
        ];

        for (const table of tables) {
            console.log(`\n=== Table: ${table} ===`);
            try {
                const [columns] = await pool.query(`DESCRIBE ${table}`);
                console.table(columns.map(c => ({
                    Field: c.Field,
                    Type: c.Type,
                    Null: c.Null,
                    Key: c.Key,
                    Default: c.Default
                })));
            } catch (err) {
                console.error(`Error describing table ${table}:`, err.message);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

checkSchema();
