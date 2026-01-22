const pool = require("../src/config/database");

const TABLES = [
    "master_eselon1",
    "master_eselon2",
    "master_upt",
    "frekuensi_pemakaian",
    "status_aplikasi",
    "environment",
    "cara_akses",
    "PDN",
    "format_laporan",
    "pic_internal",
    "pic_eksternal",
];

async function runMigration() {
    const connection = await pool.getConnection();
    try {
        console.log("Starting global timestamp column migration...");

        for (const table of TABLES) {
            console.log(`Checking table: ${table}`);

            // Check created_at
            const [cols1] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'created_at'`);
            if (cols1.length === 0) {
                console.log(`Adding created_at to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
            }

            // Check updated_at
            const [cols2] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'updated_at'`);
            if (cols2.length === 0) {
                console.log(`Adding updated_at to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            }
        }

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

runMigration();
