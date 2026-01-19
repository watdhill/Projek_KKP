-- Add column for storing multiple cara_akses as JSON
-- Run this SQL migration on your database

USE kkp_db;

ALTER TABLE data_aplikasi 
ADD COLUMN cara_akses_multiple TEXT COMMENT 'JSON array of multiple cara_akses_id' 
AFTER cara_akses_id;
