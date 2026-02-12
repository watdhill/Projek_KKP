-- Migration untuk Dynamic Master Data Table Management
-- Jalankan: mysql -u root -p kkp_db < database/dynamic_master_tables.sql

-- Tabel untuk menyimpan registry/metadata tipe master data
CREATE TABLE IF NOT EXISTS master_table_registry (
  registry_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(64) UNIQUE NOT NULL COMMENT 'Nama tabel di database',
  display_name VARCHAR(100) NOT NULL COMMENT 'Nama untuk ditampilkan di UI',
  id_field_name VARCHAR(64) NOT NULL COMMENT 'Nama kolom primary key',
  table_schema JSON NOT NULL COMMENT 'Full schema definition',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'system',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status_aktif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk menyimpan definisi kolom per tabel
CREATE TABLE IF NOT EXISTS master_table_columns (
  column_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  registry_id BIGINT UNSIGNED NOT NULL,
  column_name VARCHAR(64) NOT NULL COMMENT 'Nama kolom',
  display_name VARCHAR(100) NOT NULL COMMENT 'Label untuk UI',
  column_type ENUM('VARCHAR', 'INT', 'BIGINT', 'TEXT', 'DATE', 'BOOLEAN', 'DECIMAL') NOT NULL,
  column_length INT DEFAULT NULL COMMENT 'Panjang untuk VARCHAR/DECIMAL',
  is_nullable BOOLEAN DEFAULT TRUE,
  default_value VARCHAR(255) DEFAULT NULL,
  is_unique BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  FOREIGN KEY (registry_id) REFERENCES master_table_registry(registry_id) ON DELETE CASCADE,
  UNIQUE KEY unique_column_per_table (registry_id, column_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index untuk performa
CREATE INDEX idx_table_status ON master_table_registry(status_aktif);
CREATE INDEX idx_display_order ON master_table_columns(registry_id, display_order);
