const pool = require('./src/config/database');

async function testFormatExport() {
  console.log('=== TESTING EXPORT DIFFERENCES ===\n');
  
  try {
    // Test regular format export structure
    console.log('🔍 REGULAR FORMAT HIERARCHICAL STRUCTURE:');
    
    const formatId = 1; // abcd format
    
    // Get format details like in laporanController
    const [details] = await pool.query(`
      SELECT 
        fld.id,
        fld.format_laporan_id,
        fld.parent_id,
        fld.judul,
        fld.is_header,
        mlf.kode_field as field_name,
        mlf.nama_field as label_tampilan,
        fld.field_id,
        fld.id as order_index,
        COALESCE(mlf.urutan, 999) as urutan,
        mlf.level,
        mlf.parent_id as mlf_parent_id
      FROM format_laporan_detail fld
      LEFT JOIN master_laporan_field mlf ON fld.field_id = mlf.field_id
      WHERE fld.format_laporan_id = ?
      ORDER BY fld.id ASC
    `, [formatId]);
    
    console.table(details.slice(0, 10));
    
    // Test archive format export structure 
    console.log('\n🗃️ ARCHIVE FORMAT STRUCTURE (what archive export uses):');
    
    const [archiveDetails] = await pool.query(`
      SELECT 
        fda.field_name,
        fda.kode_field, 
        fda.order_index,
        mlf.field_id,
        mlf.nama_field as label_tampilan,
        mlf.parent_id,  
        mlf.level,
        mlf.urutan
      FROM format_laporan_detail_archive fda
      JOIN format_laporan_archive fa ON fa.archive_id = fda.archive_id
      LEFT JOIN master_laporan_field mlf ON mlf.kode_field COLLATE utf8mb4_general_ci = fda.kode_field COLLATE utf8mb4_general_ci
      WHERE fa.format_laporan_id = ? AND fa.tahun_archive = 2026
      ORDER BY fda.order_index ASC
    `, [formatId]);

    console.table(archiveDetails.slice(0, 10));
    
    console.log('\n📊 STRUCTURAL DIFFERENCES:');
    console.log('Regular format preserves:');
    console.log('- Parent-child relationships via field_id');  
    console.log('- Hierarchical levels');
    console.log('- Original order from format_laporan_detail');
    
    console.log('\nArchive format has:');
    console.log('- Flat field list');
    console.log('- No preserved hierarchy'); 
    console.log('- Different ordering (archive order_index)');
    
    // Check what hierarchy looks like
    const fieldsWithHierarchy = details.filter(d => d.level && d.level < 3);
    console.log('\n🏗️ HIERARCHICAL FIELDS (Level 1 & 2):');
    console.table(fieldsWithHierarchy);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFormatExport();