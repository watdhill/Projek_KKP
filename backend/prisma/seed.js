/**
 * Prisma Seed Script
 * Untuk mengisi data master (roles, eselon, dll) ke database
 * 
 * Cara pakai:
 * 1. npm run prisma:seed
 * 2. Atau otomatis saat: npx prisma migrate reset
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kkp_db',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    // Seed Roles
    console.log('📝 Seeding roles...');
    const roles = [
      { role_id: 1, nama_role: 'Admin' },
      { role_id: 2, nama_role: 'Supervisor' },
      { role_id: 3, nama_role: 'User' },
      { role_id: 4, nama_role: 'Viewer' }
    ];

    for (const role of roles) {
      await connection.execute(
        `INSERT INTO roles (role_id, nama_role) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE nama_role = VALUES(nama_role)`,
        [role.role_id, role.nama_role]
      );
    }
    console.log('✓ Roles seeded');

    // Seed Master Eselon 1
    console.log('📝 Seeding master_eselon1...');
    const eselon1List = [
      { eselon1_id: 1, nama_eselon1: 'Sekretariat Inspektorat Jenderal', singkatan: 'SETITJEN', status_aktif: 1 },
      { eselon1_id: 2, nama_eselon1: 'Inspektorat I', singkatan: 'IT I', status_aktif: 1 },
      { eselon1_id: 3, nama_eselon1: 'Inspektorat II', singkatan: 'IT II', status_aktif: 1 }
    ];

    for (const eselon1 of eselon1List) {
      await connection.execute(
        `INSERT INTO master_eselon1 (eselon1_id, nama_eselon1, singkatan, status_aktif) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE nama_eselon1 = VALUES(nama_eselon1), singkatan = VALUES(singkatan)`,
        [eselon1.eselon1_id, eselon1.nama_eselon1, eselon1.singkatan, eselon1.status_aktif]
      );
    }
    console.log('✓ Master Eselon 1 seeded');

    // Seed Master Eselon 2
    console.log('📝 Seeding master_eselon2...');
    const eselon2List = [
      { eselon2_id: 1, eselon1_id: 1, nama_eselon2: 'Bagian Umum', status_aktif: 1 },
      { eselon2_id: 2, eselon1_id: 1, nama_eselon2: 'Bagian Perencanaan dan Keuangan', status_aktif: 1 },
      { eselon2_id: 3, eselon1_id: 2, nama_eselon2: 'Subbag Tata Usaha Inspektorat I', status_aktif: 1 },
      { eselon2_id: 4, eselon1_id: 3, nama_eselon2: 'Subbag Tata Usaha Inspektorat II', status_aktif: 1 }
    ];

    for (const eselon2 of eselon2List) {
      await connection.execute(
        `INSERT INTO master_eselon2 (eselon2_id, eselon1_id, nama_eselon2, status_aktif) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE eselon1_id = VALUES(eselon1_id), nama_eselon2 = VALUES(nama_eselon2)`,
        [eselon2.eselon2_id, eselon2.eselon1_id, eselon2.nama_eselon2, eselon2.status_aktif]
      );
    }
    console.log('✓ Master Eselon 2 seeded');

    // Seed Cara Akses
    console.log('📝 Seeding cara_akses...');
    const caraAksesList = [
      { cara_akses_id: 1, nama_cara_akses: 'Web Browser', status_aktif: 1 },
      { cara_akses_id: 2, nama_cara_akses: 'Mobile App', status_aktif: 1 },
      { cara_akses_id: 3, nama_cara_akses: 'API', status_aktif: 1 },
      { cara_akses_id: 4, nama_cara_akses: 'Desktop Client', status_aktif: 1 }
    ];

    for (const akses of caraAksesList) {
      await connection.execute(
        `INSERT INTO cara_akses (cara_akses_id, nama_cara_akses, status_aktif) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE nama_cara_akses = VALUES(nama_cara_akses)`,
        [akses.cara_akses_id, akses.nama_cara_akses, akses.status_aktif]
      );
    }
    console.log('✓ Cara Akses seeded');

    // Seed Status Aplikasi
    console.log('📝 Seeding status_aplikasi...');
    const statusList = [
      { status_aplikasi_id: 1, nama_status: 'Aktif' },
      { status_aplikasi_id: 2, nama_status: 'Inactive' },
      { status_aplikasi_id: 3, nama_status: 'Development' },
      { status_aplikasi_id: 4, nama_status: 'Maintenance' }
    ];

    for (const status of statusList) {
      await connection.execute(
        `INSERT INTO status_aplikasi (status_aplikasi_id, nama_status) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE nama_status = VALUES(nama_status)`,
        [status.status_aplikasi_id, status.nama_status]
      );
    }
    console.log('✓ Status Aplikasi seeded');

    // Seed Frekuensi Pemakaian
    console.log('📝 Seeding frekuensi_pemakaian...');
    const frekuensiList = [
      { frekuensi_pemakaian_id: 1, nama_frekuensi: 'Setiap Hari', status_aktif: 1 },
      { frekuensi_pemakaian_id: 2, nama_frekuensi: 'Mingguan', status_aktif: 1 },
      { frekuensi_pemakaian_id: 3, nama_frekuensi: 'Bulanan', status_aktif: 1 },
      { frekuensi_pemakaian_id: 4, nama_frekuensi: 'Tahunan', status_aktif: 1 }
    ];

    for (const freq of frekuensiList) {
      await connection.execute(
        `INSERT INTO frekuensi_pemakaian (frekuensi_pemakaian_id, nama_frekuensi, status_aktif) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE nama_frekuensi = VALUES(nama_frekuensi)`,
        [freq.frekuensi_pemakaian_id, freq.nama_frekuensi, freq.status_aktif]
      );
    }
    console.log('✓ Frekuensi Pemakaian seeded');

    // Seed PDN
    console.log('📝 Seeding pdn...');
    const pdnList = [
      { pdn_id: 1, kode_pdn: 'PDN-001', status_aktif: 1 },
      { pdn_id: 2, kode_pdn: 'PDN-002', status_aktif: 1 },
      { pdn_id: 3, kode_pdn: 'PDN-003', status_aktif: 1 }
    ];

    for (const pdn of pdnList) {
      await connection.execute(
        `INSERT INTO pdn (pdn_id, kode_pdn, status_aktif) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE kode_pdn = VALUES(kode_pdn)`,
        [pdn.pdn_id, pdn.kode_pdn, pdn.status_aktif]
      );
    }
    console.log('✓ PDN seeded');

    // Seed Environment
    console.log('📝 Seeding environment...');
    const envList = [
      { jenis_environment: 'Production', status_aktif: 1 },
      { jenis_environment: 'Staging', status_aktif: 1 },
      { jenis_environment: 'Development', status_aktif: 1 },
      { jenis_environment: 'Testing', status_aktif: 1 }
    ];

    for (const env of envList) {
      await connection.execute(
        `INSERT INTO environment (jenis_environment, status_aktif) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE status_aktif = VALUES(status_aktif)`,
        [env.jenis_environment, env.status_aktif]
      );
    }
    console.log('✓ Environment seeded');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
