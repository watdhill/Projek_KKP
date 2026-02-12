-- Simple SSL Migration Script for phpMyAdmin
-- Purpose: Add ssl_expired column to data_aplikasi table
-- Date: 2026-01-28
-- Database: kkp_db
-- Note: Column ssl already exists, only adding ssl_expired

-- Add ssl_expired column after ssl
ALTER TABLE `data_aplikasi`
  ADD COLUMN `ssl_expired` DATE NULL AFTER `ssl`;

-- Verify the column was added
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_TYPE,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kkp_db'
  AND TABLE_NAME = 'data_aplikasi'
  AND COLUMN_NAME = 'ssl_expired';
