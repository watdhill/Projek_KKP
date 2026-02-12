-- Migration: Add hierarchical columns to format_laporan_detail
-- This enables support for judul (title) and sub-judul (subtitle) structure

ALTER TABLE format_laporan_detail
ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER format_laporan_id,
ADD COLUMN judul VARCHAR(200) NULL AFTER parent_id,
ADD COLUMN is_header TINYINT(1) DEFAULT 0 AFTER judul,
ADD FOREIGN KEY (parent_id) REFERENCES format_laporan_detail(detail_id) ON DELETE CASCADE;

-- Update existing data to set judul from label_tampilan
UPDATE format_laporan_detail SET judul = label_tampilan WHERE judul IS NULL;

-- Comments:
-- parent_id: References parent detail_id for hierarchy (NULL for top-level)
-- judul: Title/header text (e.g., "Arsitektur Infrastruktur")
-- is_header: 1 if this is a header row (no field_name), 0 if data field
-- field_name: Can be NULL for header rows
