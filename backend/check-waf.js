const pool = require('./src/config/database');

async function check() {
    try {
        const [rows] = await pool.query(`
            SELECT nama_aplikasi, waf, waf_lainnya 
            FROM data_aplikasi 
            LIMIT 10
        `);
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
