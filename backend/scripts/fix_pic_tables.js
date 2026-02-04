const pool = require("../src/config/database");

async function checkAndFixPIC() {
    const connection = await pool.getConnection();
    try {
        const tables = ["pic_internal", "pic_eksternal"];
        for (const table of tables) {
            console.log(`Checking table: ${table}`);
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const columnNames = columns.map(c => c.Field);

            if (!columnNames.includes("upt_id")) {
                console.log(`Adding upt_id to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN upt_id INT NULL AFTER eselon2_id`);
                await connection.query(`ALTER TABLE ${table} MODIFY COLUMN eselon2_id INT NULL`);
                console.log(`Success: upt_id added to ${table}`);
            } else {
                console.log(`upt_id already exists in ${table}`);
                // Ensure eselon2_id is nullable
                await connection.query(`ALTER TABLE ${table} MODIFY COLUMN eselon2_id INT NULL`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

checkAndFixPIC();
