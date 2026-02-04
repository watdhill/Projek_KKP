const pool = require("../src/config/database");

async function checkPICStructure() {
    const connection = await pool.getConnection();
    try {
        const tables = ["pic_internal", "pic_eksternal"];
        for (const table of tables) {
            console.log(`\n--- Structure of ${table} ---`);
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            columns.forEach(col => {
                console.log(`${col.Field}: ${col.Type} | Null: ${col.Null} | Key: ${col.Key} | Default: ${col.Default}`);
            });

            console.log(`\n--- Foreign keys for ${table} ---`);
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
            fks.forEach(fk => {
                console.log(`Column: ${fk.COLUMN_NAME} | Constraint: ${fk.CONSTRAINT_NAME} | Ref Table: ${fk.REFERENCED_TABLE_NAME} | Ref Col: ${fk.REFERENCED_COLUMN_NAME}`);
            });
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

checkPICStructure();
