const pool = require('./src/config/database');

async function compareFormats() {
  console.log('=== COMPARING FORMAT STRUCTURES ===\n');
  
  try {
    // 1. Check regular format structure 
    console.log('🔍 FORMAT REGULER (format_laporan_detail):');
    const [regularFormat] = await pool.query(`
      SELECT 
        fd.id,
        fd.format_laporan_id,
        fd.field_id,
        mlf.kode_field,
        mlf.nama_field,
        mlf.level,
        mlf.parent_id
      FROM format_laporan_detail fd
      JOIN master_laporan_field mlf ON fd.field_id = mlf.field_id 
      WHERE fd.format_laporan_id = 'abcd'
      ORDER BY fd.id
      LIMIT 10
    `);
    
    console.table(regularFormat);
    
    console.log('\n🗃️ FORMAT ARCHIVE (format_laporan_detail_archive):');
    const [archiveFormat] = await pool.query(`
      SELECT 
        fda.field_name,
        fda.kode_field,
        fda.order_index,
        fa.nama_format,
        fa.format_laporan_id
      FROM format_laporan_detail_archive fda
      JOIN format_laporan_archive fa ON fa.archive_id = fda.archive_id
      WHERE fa.format_laporan_id = 'abcd' AND fa.tahun_archive = 2026
      ORDER BY fda.order_index
      LIMIT 10
    `);
    
    console.table(archiveFormat);
    
    // 3. Check if master_laporan_field has corresponding kode_field
    console.log('\n🔗 MASTER LAPORAN FIELD untuk archived codes:');
    if (archiveFormat.length > 0) {
      const codes = archiveFormat.map(f => f.kode_field).filter(c => c).slice(0, 5);
      if (codes.length > 0) {
        const placeholders = codes.map(() => '?').join(',');
        const [masterFields] = await pool.query(`
          SELECT field_id, kode_field, nama_field, level, parent_id 
          FROM master_laporan_field 
          WHERE kode_field IN (${placeholders})
        `, codes);
        console.table(masterFields);
      }
    }
    
    console.log('\n📊 ANALYSIS:');
    console.log(`Regular format fields: ${regularFormat.length}`);
    console.log(`Archive format fields: ${archiveFormat.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

compareFormats();