const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function addNoColumnToEselon2() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('=== Adding "no" column to master_eselon2 ===\n');

        // Check if column already exists
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'master_eselon2' AND COLUMN_NAME = 'no'`,
            [process.env.DB_NAME]
        );

        if (columns.length > 0) {
            console.log('Column "no" already exists in master_eselon2. Skipping.');
        } else {
            console.log('Adding column "no" to master_eselon2...');
            await connection.execute(
                `ALTER TABLE master_eselon2 ADD COLUMN no INT NULL AFTER eselon2_id`
            );
            console.log('Column "no" added successfully!');

            // Auto-populate existing records with sequential numbers
            console.log('\nAuto-populating existing records with sequential numbers...');
            const [rows] = await connection.execute(
                'SELECT eselon2_id FROM master_eselon2 ORDER BY eselon2_id ASC'
            );

            for (let i = 0; i < rows.length; i++) {
                await connection.execute(
                    'UPDATE master_eselon2 SET no = ? WHERE eselon2_id = ?',
                    [i + 1, rows[i].eselon2_id]
                );
            }
            console.log(`Updated ${rows.length} records with sequential numbers.`);
        }

        // Show current structure
        console.log('\n=== Current master_eselon2 Structure ===');
        const [structure] = await connection.execute('DESCRIBE master_eselon2');
        console.table(structure);

        // Show sample data
        console.log('\n=== Sample Data ===');
        const [data] = await connection.execute('SELECT eselon2_id, no, nama_eselon2 FROM master_eselon2 LIMIT 10');
        console.table(data);

        console.log('\n✓ Done!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

addNoColumnToEselon2();
