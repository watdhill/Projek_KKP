const pool = require('./src/config/database');

async function checkAndFixVAPT() {
    try {
        console.log('=== Checking VA/PT Structure ===');

        // 1. Find VA/PT parent field
        const [vapt] = await pool.query(`
      SELECT field_id, nama_field, level 
      FROM master_laporan_field 
      WHERE nama_field LIKE '%VA%PT%' AND level = 2
      LIMIT 1
    `);

        if (vapt.length === 0) {
            console.log('VA/PT parent field not found');
            return;
        }

        const vaptParent = vapt[0];
        console.log('VA/PT Parent:', vaptParent);

        // 2. Check if child fields exist
        const [children] = await pool.query(`
      SELECT field_id, nama_field, kode_field 
      FROM master_laporan_field 
      WHERE parent_id = ? AND level = 3
    `, [vaptParent.field_id]);

        console.log('Existing children:', children.length);
        children.forEach(c => console.log(' -', c.nama_field, '(', c.kode_field, ')'));

        // 3. Check if we need to add fields
        const hasStatus = children.some(c => c.kode_field === 'va_pt_status' || c.nama_field.includes('Ya'));
        const hasWaktu = children.some(c => c.kode_field === 'va_pt_waktu' || c.nama_field.includes('Waktu'));

        console.log('Has Status field:', hasStatus);
        console.log('Has Waktu field:', hasWaktu);

        // 4. Get max urutan for Level 3
        const [maxUrutan] = await pool.query(`
      SELECT MAX(urutan) as max_urutan 
      FROM master_laporan_field 
      WHERE level = 3
    `);

        let nextUrutan = (maxUrutan[0].max_urutan || 0) + 1;

        // 5. Add missing fields (without status_aktif column)
        if (!hasStatus) {
            console.log('\\nAdding Ya/Tidak field...');
            await pool.query(`
        INSERT INTO master_laporan_field 
        (nama_field, kode_field, parent_id, level, urutan)
        VALUES (?, ?, ?, 3, ?)
      `, ['Ya / Tidak', 'va_pt_status', vaptParent.field_id, nextUrutan++]);
            console.log('✅ Added Ya/Tidak field');
        }

        if (!hasWaktu) {
            console.log('\\nAdding Waktu VA/PT field...');
            await pool.query(`
        INSERT INTO master_laporan_field 
        (nama_field, kode_field, parent_id, level, urutan)
        VALUES (?, ?, ?, 3, ?)
      `, ['Waktu VA / PT', 'va_pt_waktu', vaptParent.field_id, nextUrutan++]);
            console.log('✅ Added Waktu VA/PT field');
        }

        // 6. Show final structure
        const [finalChildren] = await pool.query(`
      SELECT field_id, nama_field, kode_field 
      FROM master_laporan_field 
      WHERE parent_id = ? AND level = 3
    `, [vaptParent.field_id]);

        console.log('\\n=== Final VA/PT Structure ===');
        console.log('Parent:', vaptParent.nama_field);
        finalChildren.forEach(c => console.log(' -', c.nama_field, '→', c.kode_field, '(ID:', c.field_id, ')'));

        console.log('\\n✅ Done! Now you need to:');
        console.log('1. Go to Master Data → Format Laporan');
        console.log('2. Edit format "bpk"');
        console.log('3. Expand "VA/PT" and check the child fields:');
        finalChildren.forEach(c => console.log('   ☐', c.nama_field));
        console.log('4. Save and export again');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndFixVAPT();
