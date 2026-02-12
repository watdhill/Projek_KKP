const pool = require('./src/config/database');

async function testArchiveData() {
  const connection = await pool.getConnection();
  
  try {
    const year = 2026;
    const trigger = "manual";
    const user_id = 1;
    
    console.log('Testing archive data aplikasi for year:', year);
    
    await connection.beginTransaction();
    
    // Check if already archived
    const [existing] = await connection.query(
      "SELECT COUNT(*) as count FROM data_aplikasi_archive WHERE archive_year = ?",
      [year]
    );
    
    if (existing[0].count > 0) {
      console.log('Already archived ' + existing[0].count + ' records, deleting first...');
      await connection.query(
        "DELETE FROM data_aplikasi_archive WHERE archive_year = ?",
        [year]
      );
    }
    
    // Get all data aplikasi (limit 5 for testing)
    console.log('Getting all data aplikasi...');
    const sqlQuery = `
      SELECT 
        nama_aplikasi as original_id,
        nama_aplikasi,
        status_aplikasi as status,
        eselon1_id,
        eselon2_id,
        upt_id,
        environment_id,
        domain as domain_aplikasi,
        cara_akses_multiple as cara_akses,
        pic_internal,
        pic_eksternal,
        kontak_pic_internal,
        kontak_pic_eksternal,
        cloud as penyedia_hosting,
        waf as keamanan_aplikasi,
        \`ssl\` as sertifikat_ssl,
        ssl_expired as ssl_expired_date,
        waf_lainnya,
        akses_aplikasi_username as username,
        akses_aplikasi_password_enc as password,
        basis_data as database_aplikasi,
        pdn_backup,
        unit_pengembang as pihak_ketiga,
        perangkat_lunak as integrasi_lain,
        deskripsi_fungsi as penjelasan_aplikasi,
        keterangan
      FROM data_aplikasi
      LIMIT 5
    `;
    
    const [dataAplikasi] = await connection.query(sqlQuery);
    
    console.log('Found data aplikasi:', dataAplikasi.length);
    
    if (dataAplikasi.length === 0) {
      throw new Error("Tidak ada data aplikasi untuk di-archive");
    }
    
    let archivedCount = 0;
    
    // Archive each data aplikasi
    for (const app of dataAplikasi) {
      console.log('\\nArchiving: ' + app.nama_aplikasi);
      
      const [result] = await connection.query(
        `INSERT INTO data_aplikasi_archive (
          archive_year,
          original_id,
          nama_aplikasi,
          status,
          eselon1_id,
          eselon2_id,
          upt_id,
          environment_id,
          domain_aplikasi,
          cara_akses,
          pic_internal,
          pic_eksternal,
          kontak_pic_internal,
          kontak_pic_eksternal,
          penyedia_hosting,
          keamanan_aplikasi,
          sertifikat_ssl,
          ssl_expired_date,
          waf_lainnya,
          username,
          password,
          database_aplikasi,
          pdn_backup,
          pihak_ketiga,
          integrasi_lain,
          penjelasan_aplikasi,
          keterangan,
          archived_by,
          archive_trigger
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          year,
          app.original_id,
          app.nama_aplikasi,
          app.status,
          app.eselon1_id,
          app.eselon2_id,
          app.upt_id,
          app.environment_id,
          app.domain_aplikasi,
          app.cara_akses || null,  // Already JSON or null
          app.pic_internal,
          app.pic_eksternal,
          app.kontak_pic_internal ? JSON.stringify({phone: app.kontak_pic_internal}) : null,
          app.kontak_pic_eksternal ? JSON.stringify({phone: app.kontak_pic_eksternal}) : null,
          app.penyedia_hosting,
          app.keamanan_aplikasi,
          app.sertifikat_ssl,
          app.ssl_expired_date,
          app.waf_lainnya,
          app.username,
          app.password,
          app.database_aplikasi,
          app.pdn_backup,
          app.pihak_ketiga,
          app.integrasi_lain,
          app.penjelasan_aplikasi,
          app.keterangan,
          user_id,
          trigger,
        ]
      );
      
      console.log('  - Archived with ID: ' + result.insertId);
      archivedCount++;
    }
    
    await connection.commit();
    
    console.log('\\n✅ SUCCESS!');
    console.log('- Data aplikasi archived: ' + archivedCount);
    
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('\\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

testArchiveData();
