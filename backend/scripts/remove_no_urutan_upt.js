const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function removeNoUrutanUpt() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // Check if column exists before dropping
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'master_upt' AND COLUMN_NAME = 'no_urutan'`,
            [dbConfig.database]
        );

        if (columns.length > 0) {
            console.log('Column no_urutan found in master_upt. Dropping...');
            await connection.execute(`ALTER TABLE master_upt DROP COLUMN no_urutan`);
            console.log('Column no_urutan dropped successfully.');
        } else {
            console.log('Column no_urutan does not exist in master_upt. Skipping.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

removeNoUrutanUpt();
