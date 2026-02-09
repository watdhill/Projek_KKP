const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function addUniqueConstraintEselon2() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('=== Adding unique constraint for (eselon1_id, no) to master_eselon2 ===\n');

        // Check if constraint already exists
        const [constraints] = await connection.execute(
            `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'master_eselon2' 
             AND CONSTRAINT_NAME = 'unique_eselon1_no'`,
            [process.env.DB_NAME]
        );

        if (constraints.length > 0) {
            console.log('Unique constraint already exists. Skipping.');
        } else {
            console.log('Adding unique constraint...');
            await connection.execute(
                `ALTER TABLE master_eselon2 
                 ADD CONSTRAINT unique_eselon1_no UNIQUE (eselon1_id, no)`
            );
            console.log('Unique constraint added successfully!');
        }

        // Show current constraints
        console.log('\n=== Current Constraints on master_eselon2 ===');
        const [allConstraints] = await connection.execute(
            `SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'master_eselon2'`,
            [process.env.DB_NAME]
        );
        console.table(allConstraints);

        console.log('\n✓ Done!');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('\n⚠️  Ada data duplikat yang perlu dibersihkan terlebih dahulu.');
            console.log('Menampilkan data duplikat...\n');

            const [duplicates] = await connection.execute(
                `SELECT eselon1_id, no, COUNT(*) as count 
                 FROM master_eselon2 
                 WHERE no IS NOT NULL 
                 GROUP BY eselon1_id, no 
                 HAVING count > 1`
            );
            console.table(duplicates);
        }
    } finally {
        await connection.end();
    }
}

addUniqueConstraintEselon2();
