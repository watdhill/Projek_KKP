const pool = require("../src/config/database");

async function checkPICStructure() {
    const connection = await pool.getConnection();
    try {
        const tables = ["pic_internal", "pic_eksternal"];
        for (const table of tables) {
            console.log(`\nStructure of ${table}:`);
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            console.table(columns);

            console.log(`Foreign keys for ${table}:`);
            const [fks] = await connection.query(`
                SELECT 
                    COLUMN_NAME, 
                    CONSTRAINT_NAME, 
                    REFERENCED_TABLE_NAME, 
                    REFERENCED_COLUMN_NAME
                FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                    TABLE_SCHEMA = 'kkp_db' AND
                    TABLE_NAME = ? AND
                    REFERENCED_TABLE_NAME IS NOT NULL
            `, [table]);
            console.table(fks);
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

checkPICStructure();
