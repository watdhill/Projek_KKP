require("dotenv").config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkAndSetupDatabase() {
  let connection;
  
  try {
    console.log('🔍 Memeriksa koneksi database...');
    
    // Koneksi tanpa database spesifik dulu
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    console.log('✅ Koneksi ke MySQL berhasil');
    
    // Cek apakah database kkp_db ada
    const [databases] = await connection.query('SHOW DATABASES LIKE "kkp_db"');
    
    if (databases.length === 0) {
      console.log('⚠️  Database kkp_db tidak ditemukan');
      console.log('📦 Membuat database kkp_db...');
      await connection.query('CREATE DATABASE kkp_db');
      console.log('✅ Database kkp_db berhasil dibuat');
    } else {
      console.log('✅ Database kkp_db sudah ada');
    }
    
    // Gunakan database kkp_db
    await connection.query('USE kkp_db');
    
    // Cek apakah tabel sudah ada
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Jumlah tabel: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('⚠️  Tidak ada tabel, mengimport schema.sql...');
      
      // Baca file schema.sql
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        console.error('❌ File schema.sql tidak ditemukan di:', schemaPath);
        return;
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Hapus perintah CREATE DATABASE dan USE dari schema
      const cleanedSchema = schema
        .replace(/CREATE DATABASE IF NOT EXISTS kkp_db;/gi, '')
        .replace(/USE kkp_db;/gi, '');
      
      console.log('📝 Menjalankan schema.sql...');
      await connection.query(cleanedSchema);
      console.log('✅ Schema berhasil diimport');
      
      // Verifikasi tabel
      const [newTables] = await connection.query('SHOW TABLES');
      console.log(`✅ ${newTables.length} tabel berhasil dibuat`);
    } else {
      console.log('✅ Tabel sudah ada');
      
      // Tampilkan daftar tabel
      console.log('\n📋 Daftar tabel:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    // Cek data di tabel data_aplikasi
    const [apps] = await connection.query('SELECT COUNT(*) as count FROM data_aplikasi');
    console.log(`\n📊 Jumlah data aplikasi: ${apps[0].count}`);
    
    if (apps[0].count === 0) {
      console.log('⚠️  Tidak ada data aplikasi (schema mungkin tidak termasuk INSERT)');
    } else {
      console.log('✅ Data aplikasi tersedia');
      
      // Tampilkan sample data
      const [sampleApps] = await connection.query('SELECT nama_aplikasi, domain FROM data_aplikasi LIMIT 3');
      console.log('\n📝 Sample data aplikasi:');
      sampleApps.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.nama_aplikasi} - ${app.domain || 'No domain'}`);
      });
    }
    
    console.log('\n✅ Setup database selesai!');
    console.log('🚀 Silakan restart backend server Anda');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Pastikan MySQL server berjalan');
    console.error('   2. Periksa username/password di file .env');
    console.error('   3. Pastikan user memiliki hak akses CREATE DATABASE');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndSetupDatabase();
