const pool = require('./backend/src/config/database');

async function debugUpdateValidation() {
    try {
        const formatId = 4; // 'semua format'
        console.log('--- Debugging Update Validation for Format ID:', formatId);

        // 1. Get valid fields
        const [fields] = await pool.query('SELECT field_id FROM master_laporan_field LIMIT 5');
        let fieldIds = fields.map(f => f.field_id);
        console.log(`Valid Field IDs: ${fieldIds.join(', ')}`);

        // 2. Add Invalid IDs
        fieldIds.push(999901);
        fieldIds.push(999902);
        console.log(`Payload Field IDs (with invalid): ${fieldIds.join(', ')}`);

        // 3. Simulate Logic in Controller (Update Master Data Logic)
        console.log('--- Simulating Controller Logic ---');

        // Deduplicate
        fieldIds = [...new Set(fieldIds)];

        // VALIDATON
        console.log('Validating...');
        const [validFields] = await pool.query(
            "SELECT field_id FROM master_laporan_field WHERE field_id IN (?)",
            [fieldIds]
        );
        const validSet = new Set(validFields.map(f => f.field_id));
        const filteredIds = fieldIds.filter(id => validSet.has(id));

        console.log(`Filtered Field IDs: ${filteredIds.join(', ')}`);

        if (filteredIds.length !== fields.length) {
            console.error('Validation FAILED: Expected length ' + fields.length + ', got ' + filteredIds.length);
        } else {
            console.log('Validation PASSED: Invalid IDs were removed.');
        }

        if (filteredIds.length > 0) {
            // Proceed to insert
            const detailValues = filteredIds.map((fid, index) => [
                formatId,
                null,
                null,
                0,
                fid,
                index + 1
            ]);

            console.log(`Inserting ${detailValues.length} rows...`);
            const conn = await pool.getConnection();
            await conn.beginTransaction();
            try {
                await conn.query('DELETE FROM format_laporan_detail WHERE format_laporan_id = ?', [formatId]);
                const sql = "INSERT INTO format_laporan_detail (format_laporan_id, parent_id, judul, is_header, field_id, order_index) VALUES ?";
                await conn.query(sql, [detailValues]);
                console.log('INSERT SUCCESS!');
                await conn.rollback();
                console.log('Rolled back.');
            } catch (err) {
                console.error('INSERT FAILED:', err.message);
                await conn.rollback();
            } finally {
                conn.release();
            }
        }

    } catch (e) {
        console.error('General Error:', e);
    }
    process.exit();
}

debugUpdateValidation();
