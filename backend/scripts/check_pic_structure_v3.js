const pool = require("../src/config/database");
const fs = require("fs");

async function checkPICStructure() {
    const connection = await pool.getConnection();
    try {
        let output = "";
        const tables = ["pic_internal", "pic_eksternal"];
        for (const table of tables) {
            output += `\n--- Structure of ${table} ---\n`;
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            columns.forEach(col => {
                output += `${col.Field}: ${col.Type} | Null: ${col.Null} | Key: ${col.Key} | Default: ${col.Default}\n`;
            });

            output += `\n--- Foreign keys for ${table} ---\n`;
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
                output += `Column: ${fk.COLUMN_NAME} | Constraint: ${fk.CONSTRAINT_NAME} | Ref Table: ${fk.REFERENCED_TABLE_NAME} | Ref Col: ${fk.REFERENCED_COLUMN_NAME}\n`;
            });
        }
        fs.writeFileSync("pic_structure_output.txt", output);
        console.log("Output written to pic_structure_output.txt");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

checkPICStructure();
