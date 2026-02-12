const pool = require('./src/config/database');

async function testArchiveExport() {
  console.log('=== TESTING NEW ARCHIVE EXPORT ===\n');
  
  try {
    // Test the new archive export functionality
    const formatId = 1; // abcd format  
    const year = 2026;
    
    console.log('🧪 Testing getArchivedFormatDetailsWithHierarchy...');
    
    // Import the function (simulate what snapshot controller does)
    const { laporanSnapshotController } = require('./src/controllers/laporanSnapshotController');
    
    // Instead, let's test the SQL directly
    console.log('📊 Testing archive format details query:');
    const [details] = await pool.query(`
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
      WHERE fa.format_laporan_id = ? AND fa.tahun_archive = ?
      ORDER BY fda.order_index ASC
    `, [formatId, year]);
    
    console.table(details.slice(0, 10));
    console.log(`Total fields retrieved: ${details.length}`);
    
    // Check hierarchy levels
    const byLevel = {};
    details.forEach(d => {
      if (d.level) {
        if (!byLevel[d.level]) byLevel[d.level] = 0;
        byLevel[d.level]++;
      }
    });
    
    console.log('\n📊 Fields by level:', byLevel);
    
    // Check parent-child relationships
    const withParents = details.filter(d => d.parent_id).length;
    const standalone = details.filter(d => !d.parent_id || d.parent_id === null).length;
    
    console.log(`\n🏗️ Hierarchy structure:`);
    console.log(`- Fields with parents: ${withParents}`);  
    console.log(`- Standalone fields: ${standalone}`);
    
    // Show some examples of hierarchical fields
    console.log('\n🔍 Sample hierarchical fields:');
    const hierarchicalSample = details.filter(d => d.parent_id).slice(0, 5);
    console.table(hierarchicalSample);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testArchiveExport();