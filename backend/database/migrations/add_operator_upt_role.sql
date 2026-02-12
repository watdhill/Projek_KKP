-- Menambahkan role Operator UPT
-- Role ini akan digunakan untuk pengguna yang mengelola data aplikasi di tingkat UPT

INSERT INTO roles (role_id, nama_role) 
VALUES (4, 'Operator UPT')
ON DUPLICATE KEY UPDATE nama_role = 'Operator UPT';
