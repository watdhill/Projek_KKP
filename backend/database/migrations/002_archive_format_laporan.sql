-- Migration: Create Archive Tables for Format Laporan
-- Created at: 2026-02-12 08:42:00

-- 1. Table for archiving format laporan metadata
CREATE TABLE IF NOT EXISTS `format_laporan_archive` (
    `archive_id` INT AUTO_INCREMENT PRIMARY KEY,
    `tahun_archive` INT NOT NULL,
    `format_laporan_id` INT NOT NULL,
    `nama_format` VARCHAR(255),
    `field_ids` JSON,
    `description` TEXT,
    `total_aplikasi` INT DEFAULT 0,
    `archived_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `archived_by` INT,
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`format_laporan_id`) REFERENCES `format_laporan`(`format_laporan_id`) ON DELETE CASCADE,
    FOREIGN KEY (`archived_by`) REFERENCES `master_operator`(`user_id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_archive` (`format_laporan_id`, `tahun_archive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table for archiving format laporan details (fields snapshot - denormalized)
CREATE TABLE IF NOT EXISTS `format_laporan_detail_archive` (
    `archive_detail_id` INT AUTO_INCREMENT PRIMARY KEY,
    `archive_id` INT NOT NULL,
    `field_id` INT NOT NULL,
    `field_name` VARCHAR(255),
    `order_index` INT,
    FOREIGN KEY (`archive_id`) REFERENCES `format_laporan_archive`(`archive_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table for archiving application data snapshot (Optional but recommended)
CREATE TABLE IF NOT EXISTS `data_aplikasi_archive` (
    `archive_snapshot_id` INT AUTO_INCREMENT PRIMARY KEY,
    `tahun_archive` INT NOT NULL,
    `nama_aplikasi` VARCHAR(255) NOT NULL,
    `snapshot_data` JSON,
    `archived_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_app_archive` (`tahun_archive`, `nama_aplikasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table for tracking format laporan version history
CREATE TABLE IF NOT EXISTS `format_laporan_history` (
    `history_id` INT AUTO_INCREMENT PRIMARY KEY,
    `format_laporan_id` INT NOT NULL,
    `version` INT NOT NULL,
    `field_ids_before` JSON,
    `field_ids_after` JSON,
    `changed_by` INT,
    `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `change_description` TEXT,
    FOREIGN KEY (`format_laporan_id`) REFERENCES `format_laporan`(`format_laporan_id`) ON DELETE CASCADE,
    FOREIGN KEY (`changed_by`) REFERENCES `master_operator`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Add versioning columns to format_laporan table
-- Check if column exists first to avoid error (simplified check)
SET @dbname = DATABASE();
SET @tablename = "format_laporan";
SET @columnname = "version";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE format_laporan ADD COLUMN version INT DEFAULT 1"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = "last_modified_at";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE format_laporan ADD COLUMN last_modified_at DATETIME"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = "last_modified_by";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE format_laporan ADD COLUMN last_modified_by INT"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;


-- 6. Insert new permissions for archive management
INSERT INTO `permissions` (`permission_name`, `description`)
SELECT * FROM (SELECT 'archive.create', 'Dapat membuat archive format laporan') AS tmp
WHERE NOT EXISTS (
    SELECT permission_name FROM permissions WHERE permission_name = 'archive.create'
) LIMIT 1;

INSERT INTO `permissions` (`permission_name`, `description`)
SELECT * FROM (SELECT 'archive.view', 'Dapat melihat archive') AS tmp
WHERE NOT EXISTS (
    SELECT permission_name FROM permissions WHERE permission_name = 'archive.view'
) LIMIT 1;

INSERT INTO `permissions` (`permission_name`, `description`)
SELECT * FROM (SELECT 'archive.restore', 'Dapat restore dari archive') AS tmp
WHERE NOT EXISTS (
    SELECT permission_name FROM permissions WHERE permission_name = 'archive.restore'
) LIMIT 1;

INSERT INTO `permissions` (`permission_name`, `description`)
SELECT * FROM (SELECT 'archive.delete', 'Dapat menghapus archive') AS tmp
WHERE NOT EXISTS (
    SELECT permission_name FROM permissions WHERE permission_name = 'archive.delete'
) LIMIT 1;
