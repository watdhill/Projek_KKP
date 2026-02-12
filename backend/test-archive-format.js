const pool = require('./src/config/database');

async function testArchiveFormat() {
  const connection = await pool.getConnection();
  
  try {
    const year = 2026;
    const notes = null;
    const user_id = 1;
    
    console.log('Testing archive format for year:', year);
    
    await connection.beginTransaction();
    
    // Check if already archived
    const [existing] = await connection.query(
      "SELECT archive_id FROM format_laporan_archive WHERE tahun_archive = ?",
      [year]
    );
    
    if (existing.length > 0) {
      console.log('Already archived, deleting first...');
      await connection.query(
        "DELETE FROM format_laporan_detail_archive WHERE archive_id IN (SELECT archive_id FROM format_laporan_archive WHERE tahun_archive = ?)",
        [year]
      );
      await connection.query(
        "DELETE FROM format_laporan_archive WHERE tahun_archive = ?",
        [year]
      );
    }
    
    // Get all active format laporan
    console.log('Getting active formats...');
    const [formats] = await connection.query(`
      SELECT 
        format_laporan_id,
        nama_format,
        status_aktif
      FROM format_laporan
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);
    
    console.log('Found formats:', formats.length);
    
    if (formats.length === 0) {
      throw new Error("Tidak ada format laporan aktif untuk di-archive");
    }
    
    let archivedCount = 0;
    let archivedDetailsCount = 0;
    
    // Archive each format
    for (const format of formats) {
      console.log(`\nArchiving format: ${format.nama_format}`);
      
      // Insert format archive
      const [archiveResult] = await connection.query(
        `
        INSERT INTO format_laporan_archive 
        (tahun_archive, format_laporan_id, nama_format, field_ids, status_at_archive, archived_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          year,
          format.format_laporan_id,
          format.nama_format,
          null,
          format.status_aktif ? "aktif" : "non-aktif",
          user_id,
          notes,
        ]
      );
      
      const archive_id = archiveResult.insertId;
      archivedCount++;
      console.log(`  - Archive ID: ${archive_id}`);
      
      // Get format details (fields)
      const [details] = await connection.query(
        `
        SELECT 
          fd.field_id,
          mf.nama_field,
          mf.kode_field,
          mf.level,
          mf.parent_id,
          fd.order_index
        FROM format_laporan_detail fd
        JOIN master_laporan_field mf ON fd.field_id = mf.field_id
        WHERE fd.format_laporan_id = ?
        ORDER BY fd.order_index
      `,
        [format.format_laporan_id]
      );
      
      console.log(`  - Found ${details.length} fields`);
      
      // Insert detail archives
      for (const detail of details) {
        await connection.query(
          `
          INSERT INTO format_laporan_detail_archive 
          (archive_id, field_id, field_name, kode_field, level, parent_id, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            archive_id,
            detail.field_id,
            detail.nama_field,
            detail.kode_field,
            detail.level,
            detail.parent_id,
            detail.order_index,
          ]
        );
        archivedDetailsCount++;
      }
    }
    
    await connection.commit();
    
    console.log('\n✅ SUCCESS!');
    console.log(`- Formats archived: ${archivedCount}`);
    console.log(`- Fields archived: ${archivedDetailsCount}`);
    
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

testArchiveFormat();
