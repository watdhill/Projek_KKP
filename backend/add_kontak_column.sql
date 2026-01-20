-- Add kontak column to users table
ALTER TABLE users ADD COLUMN kontak VARCHAR(20) AFTER jabatan;
