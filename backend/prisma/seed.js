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
      { role_id: 2, nama_role: 'Operator Eselon 1' },
      { role_id: 3, nama_role: 'Operator Eselon 2' }
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

    // Seed Admin User
    console.log('📝 Seeding admin user...');
    await connection.execute(
      `INSERT INTO users (role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password, status_aktif) 
       VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nama = VALUES(nama)`,
      [1, 'Administrator', '0000000000', 'admin@kkp.com', 'Administrator Sistem', 'admin123', 1]
    );
    console.log('✓ Admin user seeded (email: admin@kkp.com, password: admin123)');

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
