const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAuditColumnsToExistingDynamicTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    try {
        console.log('Adding audit columns to existing dynamic master tables...\n');

        // Get all registered dynamic tables
        const [tables] = await connection.query(`
      SELECT table_name, display_name 
      FROM master_table_registry 
      WHERE status_aktif = 1
    `);

        if (tables.length === 0) {
            console.log('No dynamic tables found.');
            return;
        }

        for (const table of tables) {
            const tableName = table.table_name;

            console.log(`Processing table: ${tableName} (${table.display_name})`);

            // Check if created_by column exists
            const [createdByCol] = await connection.query(
                "SHOW COLUMNS FROM ?? LIKE 'created_by'",
                [tableName]
            );

            if (createdByCol.length === 0) {
                await connection.query(`
          ALTER TABLE \`${tableName}\`
          ADD COLUMN \`created_by\` INT NULL COMMENT 'User ID who created this record'
          AFTER \`status_aktif\`
        `);
                console.log(`  ✓ Added created_by column`);
            } else {
                console.log(`  - created_by already exists`);
            }

            // Check if updated_by column exists
            const [updatedByCol] = await connection.query(
                "SHOW COLUMNS FROM ?? LIKE 'updated_by'",
                [tableName]
            );

            if (updatedByCol.length === 0) {
                await connection.query(`
          ALTER TABLE \`${tableName}\`
          ADD COLUMN \`updated_by\` INT NULL COMMENT 'User ID who last updated this record'
          AFTER \`created_by\`
        `);
                console.log(`  ✓ Added updated_by column`);
            } else {
                console.log(`  - updated_by already exists`);
            }

            console.log('');
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

addAuditColumnsToExistingDynamicTables()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
