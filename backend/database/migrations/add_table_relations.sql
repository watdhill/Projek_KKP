-- Migration: Menambahkan kolom table_relations untuk menyimpan relasi antar tabel
-- Jalankan: mysql -u root -p kkp_db < database/add_table_relations.sql

ALTER TABLE master_table_registry 
ADD COLUMN table_relations JSON DEFAULT NULL COMMENT 'Daftar tabel lain yang berelasi (JSON array)';
