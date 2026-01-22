const pool = require("../src/config/database");

async function runMigration() {
    const connection = await pool.getConnection();
    try {
        console.log("Starting migration: Add created_by to PIC tables...");

        const tables = ["pic_internal", "pic_eksternal"];

        for (const table of tables) {
            console.log(`Checking table: ${table}`);

            // Check if column exists
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'created_by'`);

            if (columns.length === 0) {
                console.log(`Adding created_by column to ${table}...`);
                // Add created_by column, nullable for existing records, or set default if needed.
                // Assuming user_id is INT. Adjust logic if it's UUID.
                await connection.query(`ALTER TABLE ${table} ADD COLUMN created_by INT NULL`);
                console.log(`Success: created_by added to ${table}`);
            } else {
                console.log(`Column created_by already exists in ${table}`);
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
