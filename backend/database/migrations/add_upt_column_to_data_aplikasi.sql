-- Tambah kolom upt_id ke tabel data_aplikasi
ALTER TABLE data_aplikasi 
ADD COLUMN upt_id BIGINT UNSIGNED NULL AFTER eselon2_id;

-- Tambah foreign key ke master_upt
ALTER TABLE data_aplikasi 
ADD CONSTRAINT data_aplikasi_ibfk_upt 
FOREIGN KEY (upt_id) REFERENCES master_upt(upt_id) 
ON DELETE RESTRICT 
ON UPDATE RESTRICT;

-- Tambah index untuk performa
ALTER TABLE data_aplikasi 
ADD INDEX upt_id (upt_id);
