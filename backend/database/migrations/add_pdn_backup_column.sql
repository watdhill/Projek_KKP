-- Migration: Add pdn_backup column to data_aplikasi table
-- Date: 2026-01-28
-- Purpose: Allow independent PDN backup selection separate from pdn_id

ALTER TABLE data_aplikasi 
ADD COLUMN pdn_backup VARCHAR(200) NULL 
COMMENT 'PDN Backup - dapat berbeda dari PDN Utama'
AFTER pdn_id;
