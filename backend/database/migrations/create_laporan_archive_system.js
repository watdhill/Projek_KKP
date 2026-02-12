/**
 * Migration: Create 3-Layer Archive System for Laporan
 * 
 * Purpose:
 * Layer 1: Format Archive - Snapshot struktur format laporan per tahun
 * Layer 2: Data Archive - Snapshot data aplikasi per tahun
 * Layer 3: Report Snapshots - Track generated Excel/PDF files
 * 
 * Author: System
 * Date: 2026-02-12
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('📦 Starting migration: 3-Layer Laporan Archive System...\n');

    // ============================================
    // LAYER 1: FORMAT ARCHIVE
    // ============================================
    
    console.log('📋 LAYER 1: Format Archive Tables');
    console.log('─'.repeat(60));
    
    // 1.1 Format Laporan Archive
    console.log('1️⃣  Creating format_laporan_archive table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS format_laporan_archive (
        archive_id INT AUTO_INCREMENT PRIMARY KEY,
        tahun_archive INT NOT NULL,
        format_laporan_id INT NOT NULL,
        nama_format VARCHAR(255),
        field_ids JSON COMMENT 'Array of field IDs in format',
        status_at_archive VARCHAR(50) COMMENT 'Status saat di-archive (aktif/non-aktif)',
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        archived_by INT,
        notes TEXT COMMENT 'Optional notes saat archive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_format_archive (format_laporan_id, tahun_archive),
        INDEX idx_tahun_archive (tahun_archive),
        INDEX idx_format_laporan (format_laporan_id),
        INDEX idx_archived_at (archived_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Archive snapshot of format laporan structure per year'
    `);
    console.log('   ✅ format_laporan_archive created\n');

    // 1.2 Format Laporan Detail Archive
    console.log('2️⃣  Creating format_laporan_detail_archive table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS format_laporan_detail_archive (
        archive_detail_id INT AUTO_INCREMENT PRIMARY KEY,
        archive_id INT NOT NULL,
        field_id INT NOT NULL,
        field_name VARCHAR(255) NOT NULL COMMENT 'Snapshot field name saat itu',
        kode_field VARCHAR(100) COMMENT 'Field code untuk mapping ke data_aplikasi',
        level INT COMMENT 'Hierarchy level (1, 2, 3)',
        parent_id INT COMMENT 'Parent field ID untuk nested structure',
        order_index INT COMMENT 'Display order',
        is_mandatory BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (archive_id) REFERENCES format_laporan_archive(archive_id) ON DELETE CASCADE,
        INDEX idx_archive_id (archive_id),
        INDEX idx_field_id (field_id),
        INDEX idx_order_index (order_index),
        INDEX idx_level (level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Archive snapshot of format laporan field details'
    `);
    console.log('   ✅ format_laporan_detail_archive created\n');

    // ============================================
    // LAYER 2: DATA ARCHIVE
    // ============================================
    
    console.log('📊 LAYER 2: Data Archive Table');
    console.log('─'.repeat(60));
    
    // 2.1 Data Aplikasi Archive
    console.log('3️⃣  Creating data_aplikasi_archive table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS data_aplikasi_archive (
        id INT AUTO_INCREMENT PRIMARY KEY,
        archive_year INT NOT NULL,
        original_id INT NOT NULL COMMENT 'Reference to original data_aplikasi.id',
        
        -- APPLICATION DATA SNAPSHOT (ALL FIELDS)
        nama_aplikasi VARCHAR(255) NOT NULL,
        status VARCHAR(50),
        eselon1_id INT,
        eselon2_id INT,
        upt_id INT,
        environment_id INT,
        domain_aplikasi VARCHAR(255),
        cara_akses JSON COMMENT 'Array of access methods',
        
        -- CONTACT INFO
        pic_internal VARCHAR(255),
        pic_eksternal VARCHAR(255),
        kontak_pic_internal JSON COMMENT 'Contact info: phone, email',
        kontak_pic_eksternal JSON COMMENT 'Contact info: phone, email',
        
        -- TECHNICAL DETAILS
        penyedia_hosting VARCHAR(255),
        keamanan_aplikasi VARCHAR(50),
        sertifikat_ssl VARCHAR(50),
        ssl_expired_date DATE,
        waf_lainnya VARCHAR(255),
        
        -- CREDENTIALS (encrypted)
        username VARCHAR(255),
        password TEXT COMMENT 'Encrypted password',
        
        -- DATABASE & HOSTING
        database_aplikasi VARCHAR(100),
        pdn_backup VARCHAR(50),
        
        -- INTEGRATION
        pihak_ketiga VARCHAR(255),
        integrasi_lain VARCHAR(255),
        
        -- DOCUMENTATION
        penjelasan_aplikasi TEXT,
        keterangan TEXT,
        
        -- METADATA
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        archived_by INT COMMENT 'User ID who archived',
        archive_trigger VARCHAR(50) COMMENT 'manual/auto/scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_archive_year (archive_year),
        INDEX idx_original_id (original_id),
        INDEX idx_nama_aplikasi (nama_aplikasi),
        INDEX idx_status (status),
        INDEX idx_eselon2_id (eselon2_id),
        INDEX idx_upt_id (upt_id),
        INDEX idx_archived_at (archived_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Yearly snapshot of application data for historical tracking'
    `);
    console.log('   ✅ data_aplikasi_archive created\n');

    // ============================================
    // LAYER 3: REPORT SNAPSHOTS
    // ============================================
    
    console.log('📄 LAYER 3: Report Snapshots Table');
    console.log('─'.repeat(60));
    
    // 3.1 Laporan Snapshots
    console.log('4️⃣  Creating laporan_snapshots table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS laporan_snapshots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        
        -- SNAPSHOT METADATA
        snapshot_name VARCHAR(255) NOT NULL,
        snapshot_year INT NOT NULL,
        file_type ENUM('excel', 'pdf') NOT NULL,
        file_path VARCHAR(500) NOT NULL COMMENT 'Relative path: laporan-snapshots/xxx.xlsx',
        file_size INT COMMENT 'File size in bytes',
        
        -- REFERENCES
        archive_id INT COMMENT 'Link to format_laporan_archive if used',
        
        -- FILTER CONFIGURATION (IMPORTANT!)
        filters JSON COMMENT 'Applied filters: {"eselon2": 1, "status": "aktif", etc}',
        
        -- STATISTICS
        total_records INT COMMENT 'Number of applications in this snapshot',
        
        -- USER TRACKING
        generated_by INT NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- METADATA
        description TEXT COMMENT 'Optional user description',
        is_official BOOLEAN DEFAULT FALSE COMMENT 'Official yearly report vs ad-hoc',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_snapshot_year (snapshot_year),
        INDEX idx_file_type (file_type),
        INDEX idx_generated_by (generated_by),
        INDEX idx_generated_at (generated_at),
        INDEX idx_is_official (is_official),
        INDEX idx_archive_id (archive_id),
        
        UNIQUE KEY unique_snapshot_name (snapshot_name),
        FOREIGN KEY (archive_id) REFERENCES format_laporan_archive(archive_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Track generated Excel/PDF report files'
    `);
    console.log('   ✅ laporan_snapshots created\n');

    // ============================================
    // VERIFICATION
    // ============================================
    
    console.log('🔍 Verifying table structures...');
    console.log('─'.repeat(60));
    
    const tables = [
      'format_laporan_archive',
      'format_laporan_detail_archive',
      'data_aplikasi_archive',
      'laporan_snapshots'
    ];
    
    for (const table of tables) {
      const [columns] = await connection.execute(`
        SELECT COUNT(*) as column_count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [process.env.DB_NAME, table]);
      
      console.log(`   ✅ ${table}: ${columns[0].column_count} columns`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    
    console.log('\n📝 Summary:');
    console.log('   Layer 1: Format Archive');
    console.log('     - format_laporan_archive');
    console.log('     - format_laporan_detail_archive');
    console.log('   Layer 2: Data Archive');
    console.log('     - data_aplikasi_archive');
    console.log('   Layer 3: Report Snapshots');
    console.log('     - laporan_snapshots');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Create laporanArchiveController.js');
    console.log('   2. Create laporanSnapshotController.js');
    console.log('   3. Add API routes');
    console.log('   4. Create frontend components');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = runMigration;
