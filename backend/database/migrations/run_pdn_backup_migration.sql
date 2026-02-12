-- Script untuk menjalankan migration pdn_backup
-- Jalankan dari terminal MySQL atau MySQL Workbench

USE kkp_db;

-- Tambah kolom pdn_backup
ALTER TABLE data_aplikasi 
ADD COLUMN pdn_backup VARCHAR(200) NULL 
COMMENT 'PDN Backup - dapat berbeda dari PDN Utama'
AFTER pdn_id;

-- Verifikasi kolom berhasil ditambahkan
DESCRIBE data_aplikasi;

SELECT 'Migration berhasil! Kolom pdn_backup telah ditambahkan.' AS status;
