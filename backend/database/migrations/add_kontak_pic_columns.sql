-- Add kontak_pic_internal and kontak_pic_eksternal columns to data_aplikasi table

ALTER TABLE data_aplikasi 
ADD COLUMN kontak_pic_internal VARCHAR(50) AFTER pic_internal,
ADD COLUMN kontak_pic_eksternal VARCHAR(50) AFTER pic_eksternal;

-- Update comment
ALTER TABLE data_aplikasi 
MODIFY COLUMN kontak_pic_internal VARCHAR(50) COMMENT 'Nomor kontak PIC Internal',
MODIFY COLUMN kontak_pic_eksternal VARCHAR(50) COMMENT 'Nomor kontak PIC Eksternal';
