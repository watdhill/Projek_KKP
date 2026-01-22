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
        console.log("Starting global audit column migration...");

        for (const table of TABLES) {
            console.log(`Checking table: ${table}`);

            // Check created_by
            const [cols1] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'created_by'`);
            if (cols1.length === 0) {
                console.log(`Adding created_by to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN created_by INT NULL`);
            }

            // Check updated_by
            const [cols2] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'updated_by'`);
            if (cols2.length === 0) {
                console.log(`Adding updated_by to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN updated_by INT NULL`);
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
