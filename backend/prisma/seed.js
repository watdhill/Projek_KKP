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
