const pool = require('./src/config/database');

async function analyzeFormats() {
  console.log('=== ANALYZING FORMAT STRUCTURES ===\n');
  
  try {
    // 1. List available formats  
    console.log('📋 AVAILABLE FORMATS (Regular):');
    const [formats] = await pool.query(`
      SELECT format_laporan_id, nama_format 
      FROM format_laporan 
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);
    console.table(formats);
    
    console.log('\n📋 AVAILABLE FORMATS (Archive):');
    const [archiveFormats] = await pool.query(`
      SELECT DISTINCT format_laporan_id, nama_format, tahun_archive
      FROM format_laporan_archive 
      WHERE tahun_archive = 2026
      ORDER BY nama_format
    `);
    console.table(archiveFormats);
    
    if (formats.length === 0 || archiveFormats.length === 0) {
      console.log('❌ No formats found!');
      process.exit(1);
    }
    
    // Use first available format
    const formatId = archiveFormats[0]?.format_laporan_id || formats[0]?.format_laporan_id;
    console.log(`\n🎯 Analyzing format: ${formatId}`);
    
    // 2. Check regular format structure 
    console.log('\n🔍 FORMAT REGULER (format_laporan_detail):');
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
      LEFT JOIN master_laporan_field mlf ON fd.field_id = mlf.field_id 
      WHERE fd.format_laporan_id = ?
      ORDER BY fd.id
      LIMIT 15
    `, [formatId]);
    
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
      WHERE fa.format_laporan_id = ? AND fa.tahun_archive = 2026
      ORDER BY fda.order_index
      LIMIT 15
    `, [formatId]);
    
    console.table(archiveFormat);
    
    console.log('\n📊 ANALYSIS:');
    console.log(`Regular format fields: ${regularFormat.length}`);
    console.log(`Archive format fields: ${archiveFormat.length}`);
    
    // Compare field differences
    if (regularFormat.length > 0 && archiveFormat.length > 0) {
      console.log('\n🔍 FIELD COMPARISON:');
      const regularCodes = regularFormat.map(f => f.kode_field).filter(c => c);
      const archiveCodes = archiveFormat.map(f => f.kode_field).filter(c => c);
      
      console.log('Regular field codes:', regularCodes.slice(0, 10));
      console.log('Archive field codes:', archiveCodes.slice(0, 10));
      
      const missingInArchive = regularCodes.filter(code => !archiveCodes.includes(code));
      const extraInArchive = archiveCodes.filter(code => !regularCodes.includes(code));
      
      if (missingInArchive.length > 0) {
        console.log('❌ Missing in archive:', missingInArchive);
      }
      if (extraInArchive.length > 0) {
        console.log('⚠️ Extra in archive:', extraInArchive);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeFormats();