-- Add optional Akses Aplikasi (Akun) fields (untuk kebutuhan BPK)
ALTER TABLE `data_aplikasi`
  ADD COLUMN `akses_aplikasi_username` VARCHAR(200) NULL,
  ADD COLUMN `akses_aplikasi_password_enc` TEXT NULL;
