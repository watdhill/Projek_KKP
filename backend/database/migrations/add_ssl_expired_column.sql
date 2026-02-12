-- Migration: Add ssl_expired column to data_aplikasi table
-- Purpose: Store SSL certificate expiration date
-- Date: 2026-01-28

-- Add ssl_expired column after ssl column (if ssl column exists)
-- If ssl column doesn't exist yet, this will add ssl_expired after cloud column
ALTER TABLE data_aplikasi 
ADD COLUMN ssl_expired DATE NULL 
AFTER ssl;

-- Verify the migration
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kkp_db'
  AND TABLE_NAME = 'data_aplikasi'
  AND COLUMN_NAME = 'ssl_expired';
