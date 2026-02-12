/**
 * Migration: Create application_updates table
 * 
 * Tabel ini mencatat setiap aktivitas CREATE dan UPDATE pada aplikasi.
 * Berbeda dengan audit_log yang mencatat semua aktivitas CRUD,
 * tabel ini khusus untuk menampilkan "Update Aplikasi Terbaru" di dashboard.
 * 
 * Run: node database/create_application_updates_table.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kkp_db'
    });

    console.log('Creating application_updates table...');

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS application_updates (
                update_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                nama_aplikasi VARCHAR(200) NOT NULL,
                action_type ENUM('CREATE', 'UPDATE') NOT NULL,
                
                -- Snapshot data penting saat update terjadi
                status_aplikasi_id BIGINT UNSIGNED,
                status_aplikasi_name VARCHAR(100),
                eselon1_id BIGINT UNSIGNED,
                eselon1_name VARCHAR(200),
                eselon2_id BIGINT UNSIGNED,
                eselon2_name VARCHAR(200),
                upt_id BIGINT UNSIGNED,
                upt_name VARCHAR(200),
                domain VARCHAR(200),
                
                -- Info perubahan (untuk UPDATE)
                changed_fields TEXT COMMENT 'Comma-separated list of changed fields',
                
                -- Audit info
                updated_by VARCHAR(100) COMMENT 'Username or user ID',
                ip_address VARCHAR(45),
                user_agent TEXT,
                
                -- Timestamp
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Indexes
                INDEX idx_nama_aplikasi (nama_aplikasi),
                INDEX idx_action_type (action_type),
                INDEX idx_created_at (created_at DESC),
                INDEX idx_eselon1 (eselon1_id),
                INDEX idx_eselon2 (eselon2_id),
                INDEX idx_upt (upt_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ Table application_updates created successfully.');

        // Backfill existing data from data_aplikasi as CREATE events
        console.log('\nBackfilling existing applications as CREATE events...');
        
        const backfillQuery = `
            INSERT INTO application_updates 
                (nama_aplikasi, action_type, status_aplikasi_id, status_aplikasi_name,
                 eselon1_id, eselon1_name, eselon2_id, eselon2_name, upt_id, upt_name,
                 domain, updated_by, created_at)
            SELECT 
                da.nama_aplikasi,
                'CREATE' as action_type,
                da.status_aplikasi,
                sa.nama_status,
                da.eselon1_id,
                e1.nama_eselon1,
                da.eselon2_id,
                e2.nama_eselon2,
                da.upt_id,
                upt.nama_upt,
                da.domain,
                'system' as updated_by,
                da.created_at
            FROM data_aplikasi da
            LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
            LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
            LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
            LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
            WHERE da.created_at IS NOT NULL
        `;

        const [result] = await connection.query(backfillQuery);
        console.log(`✓ Backfilled ${result.affectedRows} existing applications.`);

    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        await connection.end();
        console.log('\nDone.');
    }
}

migrate();
