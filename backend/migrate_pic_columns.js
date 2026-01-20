const pool = require('./src/config/database');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check and add columns for pic_internal
        const [colsInternal] = await pool.query('DESCRIBE pic_internal');
        const colNamesInternal = colsInternal.map(c => c.Field);

        if (!colNamesInternal.includes('email_pic')) {
            await pool.query('ALTER TABLE pic_internal ADD COLUMN email_pic VARCHAR(150) AFTER nama_pic_internal');
            console.log('Added email_pic to pic_internal');
        }
        if (!colNamesInternal.includes('no_hp_pic')) {
            await pool.query('ALTER TABLE pic_internal ADD COLUMN no_hp_pic VARCHAR(50) AFTER email_pic');
            console.log('Added no_hp_pic to pic_internal');
        }

        // Check and add columns for pic_eksternal
        const [colsEksternal] = await pool.query('DESCRIBE pic_eksternal');
        const colNamesEksternal = colsEksternal.map(c => c.Field);

        if (!colNamesEksternal.includes('email_pic')) {
            await pool.query('ALTER TABLE pic_eksternal ADD COLUMN email_pic VARCHAR(150) AFTER nama_pic_eksternal');
            console.log('Added email_pic to pic_eksternal');
        }
        if (!colNamesEksternal.includes('no_hp_pic')) {
            await pool.query('ALTER TABLE pic_eksternal ADD COLUMN no_hp_pic VARCHAR(50) AFTER email_pic');
            console.log('Added no_hp_pic to pic_eksternal');
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
