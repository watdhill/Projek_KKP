const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    console.log('Connected to database.');

    try {
        // 0. Drop existing tables for fresh start (order matters for foreign keys)
        console.log('Dropping existing tables for fresh start...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS format_laporan_detail');
        await connection.query('DROP TABLE IF EXISTS master_laporan_field');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Create master_laporan_field
        console.log('Creating master_laporan_field table...');
        await connection.query(`
      CREATE TABLE master_laporan_field (
        field_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_field VARCHAR(150) NOT NULL,
        kode_field VARCHAR(100) UNIQUE,
        parent_id INT DEFAULT NULL,
        level TINYINT(4) NOT NULL,
        urutan INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

        // 2. Create format_laporan (if not exists with correct structure)
        console.log('Ensuring format_laporan table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS format_laporan (
        format_laporan_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_format VARCHAR(150) NOT NULL,
        status_aktif TINYINT(1) DEFAULT 1,
        selected_fields LONGTEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

        // 3. Create format_laporan_detail
        console.log('Creating format_laporan_detail table...');
        await connection.query(`
      CREATE TABLE format_laporan_detail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        format_laporan_id INT NOT NULL,
        field_id INT NOT NULL,
        FOREIGN KEY (format_laporan_id) REFERENCES format_laporan(format_laporan_id) ON DELETE CASCADE,
        FOREIGN KEY (field_id) REFERENCES master_laporan_field(field_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

        // 4. Seed master_laporan_field
        console.log('Seeding master_laporan_field...');

        // Level 1: Arsitektur Infrastruktur
        const [infra] = await connection.query(
            'INSERT INTO master_laporan_field (nama_field, level, urutan) VALUES (?, ?, ?)',
            ['Arsitektur Infrastruktur', 1, 1]
        );
        const infraId = infra.insertId;

        // Level 2 under Arsitektur Infrastruktur
        const [kompUtama] = await connection.query(
            'INSERT INTO master_laporan_field (nama_field, parent_id, level, urutan) VALUES (?, ?, ?, ?)',
            ['Fasilitas Komputasi Utama', infraId, 2, 1]
        );
        const kompUtamaId = kompUtama.insertId;

        const [kompBackup] = await connection.query(
            'INSERT INTO master_laporan_field (nama_field, parent_id, level, urutan) VALUES (?, ?, ?, ?)',
            ['Fasilitas Komputasi Backup', infraId, 2, 2]
        );
        const kompBackupId = kompBackup.insertId;

        // Level 3 under Fasilitas Komputasi Utama
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['PDN', 'pusat_komputasi_utama_pdn', kompUtamaId, 3, 1]
        );
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['Pusat Komputasi', 'pusat_komputasi_utama', kompUtamaId, 3, 2]
        );

        // Level 3 under Fasilitas Komputasi Backup
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['PDN', 'pdn_id', kompBackupId, 3, 1]
        );
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['Pusat Komputasi', 'pusat_komputasi_backup', kompBackupId, 3, 2]
        );
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['Mandiri', 'mandiri_komputasi_backup', kompBackupId, 3, 3]
        );

        // Level 1: Arsitektur Keamanan
        const [keamanan] = await connection.query(
            'INSERT INTO master_laporan_field (nama_field, level, urutan) VALUES (?, ?, ?)',
            ['Arsitektur Keamanan', 1, 2]
        );
        const keamananId = keamanan.insertId;

        // Level 2 under Arsitektur Keamanan
        const [keamananDetail] = await connection.query(
            'INSERT INTO master_laporan_field (nama_field, parent_id, level, urutan) VALUES (?, ?, ?, ?)',
            ['Keamanan', keamananId, 2, 1]
        );
        const keamananDetailId = keamananDetail.insertId;

        // Level 3 under Keamanan
        await connection.query(
            'INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan) VALUES (?, ?, ?, ?, ?)',
            ['SSL', 'api_internal_status_ssl', keamananDetailId, 3, 1]
        );

        console.log('Database setup and seeding completed successfully.');
    } catch (error) {
        console.error('Error during database setup:', error);
    } finally {
        await connection.end();
    }
}

setup();
