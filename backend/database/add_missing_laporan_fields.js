/**
 * Migration: Add missing fields to master_laporan_field
 * 
 * Adds all data_aplikasi columns that are not yet available in the
 * format laporan field picker. These are added as flat Level 3 fields
 * (no parent), so they appear at the top of the picker above hierarchical items.
 * 
 * Run: node database/add_missing_laporan_fields.js
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

    console.log('Connected to database.');

    try {
        // Fields to add: these are columns in data_aplikasi that are NOT yet 
        // in master_laporan_field and NOT covered by dynamic master_table_registry.
        // They are added as flat Level 3 fields (no parent) with sequential urutan.
        const missingFields = [
            { nama_field: 'Domain', kode_field: 'domain', urutan: 1 },
            { nama_field: 'Deskripsi Fungsi', kode_field: 'deskripsi_fungsi', urutan: 2 },
            { nama_field: 'User Pengguna', kode_field: 'user_pengguna', urutan: 3 },
            { nama_field: 'Data Digunakan', kode_field: 'data_digunakan', urutan: 4 },
            { nama_field: 'Luaran/Output', kode_field: 'luaran_output', urutan: 5 },
            { nama_field: 'Server Aplikasi', kode_field: 'server_aplikasi', urutan: 6 },
            { nama_field: 'Tipe Lisensi Bahasa', kode_field: 'tipe_lisensi_bahasa', urutan: 7 },
            { nama_field: 'Bahasa Pemrograman', kode_field: 'bahasa_pemrograman', urutan: 8 },
            { nama_field: 'Basis Data', kode_field: 'basis_data', urutan: 9 },
            { nama_field: 'Kerangka Pengembangan', kode_field: 'kerangka_pengembangan', urutan: 10 },
            { nama_field: 'Unit Pengembang', kode_field: 'unit_pengembang', urutan: 11 },
            { nama_field: 'Unit Operasional Teknologi', kode_field: 'unit_operasional_teknologi', urutan: 12 },
            { nama_field: 'Nilai Pengembangan Aplikasi', kode_field: 'nilai_pengembangan_aplikasi', urutan: 13 },
            { nama_field: 'PDN Backup', kode_field: 'pdn_backup', urutan: 14 },
            { nama_field: 'SSL', kode_field: 'ssl', urutan: 15 },
            { nama_field: 'SSL Expired', kode_field: 'ssl_expired', urutan: 16 },
            { nama_field: 'WAF', kode_field: 'waf', urutan: 17 },
            { nama_field: 'WAF Lainnya', kode_field: 'waf_lainnya', urutan: 18 },
            { nama_field: 'Username Akses Aplikasi', kode_field: 'akses_aplikasi_username', urutan: 19 },
            { nama_field: 'Password Akses Aplikasi', kode_field: 'akses_aplikasi_password_enc', urutan: 20 },
            { nama_field: 'Alamat IP Publik', kode_field: 'alamat_ip_publik', urutan: 21 },
            { nama_field: 'Keterangan', kode_field: 'keterangan', urutan: 22 },
            { nama_field: 'Status BMN', kode_field: 'status_bmn', urutan: 23 },
        ];

        let addedCount = 0;
        let skippedCount = 0;

        for (const field of missingFields) {
            // Check if field already exists (by kode_field)
            const [existing] = await connection.query(
                'SELECT field_id FROM master_laporan_field WHERE kode_field = ?',
                [field.kode_field]
            );

            if (existing.length > 0) {
                console.log(`  SKIP: "${field.nama_field}" (kode: ${field.kode_field}) already exists.`);
                skippedCount++;
                continue;
            }

            // Insert as flat Level 3 field (no parent)
            await connection.query(
                `INSERT INTO master_laporan_field (nama_field, kode_field, parent_id, level, urutan, is_active) 
                 VALUES (?, ?, NULL, 3, ?, 1)`,
                [field.nama_field, field.kode_field, field.urutan]
            );
            console.log(`  ADDED: "${field.nama_field}" (kode: ${field.kode_field})`);
            addedCount++;
        }

        console.log(`\nMigration complete: ${addedCount} fields added, ${skippedCount} skipped (already exist).`);

        // Also verify the existing urutan values for flat fields to ensure proper ordering
        // Flat fields (those at top) should have lower urutan than hierarchical categories
        console.log('\nUpdating urutan for existing flat fields to ensure they appear before hierarchical...');
        
        // Get all flat fields (level 3, no parent)
        const [flatFields] = await connection.query(
            'SELECT field_id, nama_field, kode_field, urutan FROM master_laporan_field WHERE parent_id IS NULL AND level = 3 ORDER BY urutan, field_id'
        );
        
        // Re-assign urutan: 1, 2, 3, ... for flat fields
        for (let i = 0; i < flatFields.length; i++) {
            await connection.query(
                'UPDATE master_laporan_field SET urutan = ? WHERE field_id = ?',
                [i + 1, flatFields[i].field_id]
            );
        }
        console.log(`Updated urutan for ${flatFields.length} flat fields.`);

        // Set hierarchical top-level categories to higher urutan values (starting at 100)
        const [hierFields] = await connection.query(
            'SELECT field_id, nama_field FROM master_laporan_field WHERE parent_id IS NULL AND level = 1 ORDER BY urutan, field_id'
        );
        for (let i = 0; i < hierFields.length; i++) {
            await connection.query(
                'UPDATE master_laporan_field SET urutan = ? WHERE field_id = ?',
                [100 + i, hierFields[i].field_id]
            );
        }
        console.log(`Updated urutan for ${hierFields.length} hierarchical categories.`);

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await connection.end();
        console.log('Done.');
    }
}

migrate();
