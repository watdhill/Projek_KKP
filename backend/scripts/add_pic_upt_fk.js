const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPicUptForeignKeys() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    try {
        console.log('Adding foreign key constraints for upt_id in PIC tables...');

        // Add FK constraint for pic_internal
        await connection.query(`
      ALTER TABLE pic_internal
      ADD CONSTRAINT fk_pic_internal_upt
      FOREIGN KEY (upt_id) REFERENCES master_upt(upt_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
    `);
        console.log('✓ Added FK constraint: pic_internal.upt_id -> master_upt.upt_id');

        // Add FK constraint for pic_eksternal
        await connection.query(`
      ALTER TABLE pic_eksternal
      ADD CONSTRAINT fk_pic_eksternal_upt
      FOREIGN KEY (upt_id) REFERENCES master_upt(upt_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
    `);
        console.log('✓ Added FK constraint: pic_eksternal.upt_id -> master_upt.upt_id');

        console.log('\n✅ Foreign key constraints added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️  Foreign key constraints already exist, skipping...');
        } else {
            console.error('❌ Error adding foreign keys:', error.message);
            throw error;
        }
    } finally {
        await connection.end();
    }
}

addPicUptForeignKeys()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
