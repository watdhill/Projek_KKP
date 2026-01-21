-- Database KKP dengan struktur sebenarnya
CREATE DATABASE IF NOT EXISTS kkp_db;
USE kkp_db;

-- 1. Tabel Roles
CREATE TABLE IF NOT EXISTS roles (
  role_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_role VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Master Eselon Level 1
CREATE TABLE IF NOT EXISTS master_eselon1 (
  eselon1_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_eselon1 VARCHAR(200) NOT NULL,
  singkatan VARCHAR(50),
  status_aktif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Master Eselon Level 2
CREATE TABLE IF NOT EXISTS master_eselon2 (
  eselon2_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eselon1_id BIGINT UNSIGNED NOT NULL,
  nama_eselon2 VARCHAR(200) NOT NULL,
  status_aktif TINYINT(1) DEFAULT 1,
  FOREIGN KEY (eselon1_id) REFERENCES master_eselon1(eselon1_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  eselon1_id BIGINT UNSIGNED,
  eselon2_id BIGINT UNSIGNED,
  nama VARCHAR(150),
  nip VARCHAR(50),
  email VARCHAR(150),
  jabatan VARCHAR(150),
  password VARCHAR(255),
  status_aktif TINYINT(1) DEFAULT 1,
  reset_token VARCHAR(100),
  reset_token_expired DATETIME,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (eselon1_id) REFERENCES master_eselon1(eselon1_id) ON DELETE SET NULL,
  FOREIGN KEY (eselon2_id) REFERENCES master_eselon2(eselon2_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Cara Akses
CREATE TABLE IF NOT EXISTS cara_akses (
  cara_akses_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_cara_akses VARCHAR(100) NOT NULL,
  status_aktif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Frekuensi Pemakaian
CREATE TABLE IF NOT EXISTS frekuensi_pemakaian (
  frekuensi_pemakaian_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_frekuensi VARCHAR(100) NOT NULL,
  status_aktif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Status Aplikasi
CREATE TABLE IF NOT EXISTS status_aplikasi (
  status_aplikasi_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_status VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabel PDN
CREATE TABLE IF NOT EXISTS pdn (
  pdn_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_pdn VARCHAR(100),
  status_aktif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Tabel Environment
CREATE TABLE IF NOT EXISTS environment (
  environment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jenis_environment VARCHAR(100),
  status_aktif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Tabel PIC Internal
CREATE TABLE IF NOT EXISTS pic_internal (
  pic_internal_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eselon2_id BIGINT UNSIGNED,
  nama_pic_internal VARCHAR(150),
  kontak_pic_internal VARCHAR(150),
  status_aktif TINYINT(1) DEFAULT 1,
  FOREIGN KEY (eselon2_id) REFERENCES master_eselon2(eselon2_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Tabel PIC Eksternal
CREATE TABLE IF NOT EXISTS pic_eksternal (
  pic_eksternal_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eselon2_id BIGINT UNSIGNED,
  nama_pic_eksternal VARCHAR(150),
  kontak_pic_eksternal VARCHAR(150),
  status_aktif TINYINT(1) DEFAULT 1,
  FOREIGN KEY (eselon2_id) REFERENCES master_eselon2(eselon2_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Tabel Data Aplikasi
CREATE TABLE IF NOT EXISTS data_aplikasi (
  nama_aplikasi VARCHAR(200) PRIMARY KEY,
  eselon1_id BIGINT UNSIGNED,
  eselon2_id BIGINT UNSIGNED,
  cara_akses_id BIGINT UNSIGNED,
  frekuensi_pemakaian BIGINT UNSIGNED,
  status_aplikasi BIGINT UNSIGNED,
  pdn_id BIGINT UNSIGNED,
  environment_id BIGINT UNSIGNED,
  pic_internal_id BIGINT UNSIGNED,
  pic_eksternal_id BIGINT UNSIGNED,
  domain VARCHAR(200),
  deskripsi_fungsi TEXT,
  user_pengguna TEXT,
  data_digunakan TEXT,
  luaran_output TEXT,
  server_aplikasi VARCHAR(200),
  tipe_lisensi_bahasa VARCHAR(200),
  bahasa_pemrograman VARCHAR(200),
  basis_data VARCHAR(200),
  kerangka_pengembangan VARCHAR(200),
  unit_pengembang VARCHAR(200),
  unit_operasional_teknologi VARCHAR(200),
  nilai_pengembangan_aplikasi VARCHAR(200),
  pusat_komputasi_utama VARCHAR(200),
  pusat_komputasi_backup VARCHAR(200),
  mandiri_komputasi_backup VARCHAR(200),
  perangkat_lunak TEXT,
  cloud VARCHAR(200),
  waf VARCHAR(50),
  antivirus VARCHAR(50),
  va_pt_status VARCHAR(50),
  va_pt_waktu VARCHAR(100),
  alamat_ip_publik VARCHAR(100),
  keterangan TEXT,
  status_bmn VARCHAR(100),
  api_internal_status VARCHAR(50),
  FOREIGN KEY (eselon1_id) REFERENCES master_eselon1(eselon1_id) ON DELETE SET NULL,
  FOREIGN KEY (eselon2_id) REFERENCES master_eselon2(eselon2_id) ON DELETE SET NULL,
  FOREIGN KEY (cara_akses_id) REFERENCES cara_akses(cara_akses_id) ON DELETE SET NULL,
  FOREIGN KEY (frekuensi_pemakaian) REFERENCES frekuensi_pemakaian(frekuensi_pemakaian_id) ON DELETE SET NULL,
  FOREIGN KEY (status_aplikasi) REFERENCES status_aplikasi(status_aplikasi_id) ON DELETE SET NULL,
  FOREIGN KEY (pdn_id) REFERENCES pdn(pdn_id) ON DELETE SET NULL,
  FOREIGN KEY (environment_id) REFERENCES environment(environment_id) ON DELETE SET NULL,
  FOREIGN KEY (pic_internal_id) REFERENCES pic_internal(pic_internal_id) ON DELETE SET NULL,
  FOREIGN KEY (pic_eksternal_id) REFERENCES pic_eksternal(pic_eksternal_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Tabel Format Laporan
CREATE TABLE IF NOT EXISTS format_laporan (
  format_laporan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_aplikasi VARCHAR(200) NOT NULL,
  nama_format VARCHAR(200) NOT NULL,
  status_aktif TINYINT(1) DEFAULT 1,
  FOREIGN KEY (nama_aplikasi) REFERENCES data_aplikasi(nama_aplikasi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Tabel Format Laporan Detail
CREATE TABLE IF NOT EXISTS format_laporan_detail (
  detail_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  format_laporan_id BIGINT UNSIGNED NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  label_tampilan VARCHAR(150) NOT NULL,
  urutan INT NOT NULL,
  FOREIGN KEY (format_laporan_id) REFERENCES format_laporan(format_laporan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample Roles
INSERT IGNORE INTO roles (role_id, nama_role) VALUES 
(1, 'Admin'),
(2, 'Supervisor'),
(3, 'User'),
(4, 'Viewer');

-- Sample Master Eselon 1
INSERT IGNORE INTO master_eselon1 (eselon1_id, nama_eselon1, singkatan, status_aktif) VALUES 
(1, 'Sekretariat Negara', 'Sekneg', 1),
(2, 'Kementerian Pendidikan', 'Kemendikbud', 1),
(3, 'Kementerian Kesehatan', 'Kemenkes', 1);

-- Sample Master Eselon 2
INSERT IGNORE INTO master_eselon2 (eselon2_id, eselon1_id, nama_eselon2, status_aktif) VALUES 
(1, 1, 'Biro Teknologi Informasi', 1),
(2, 1, 'Biro Hukum', 1),
(3, 2, 'Direktorat Jenderal Pendidikan Dasar dan Menengah', 1),
(4, 3, 'Direktorat Jenderal Kesehatan Masyarakat', 1);

-- Sample Users
INSERT IGNORE INTO users (user_id, role_id, eselon1_id, eselon2_id, nama, nip, email, jabatan, password, status_aktif) VALUES 
(1, 1, 1, 1, 'Budi Santoso', '197501011998031001', 'budi@sekneg.go.id', 'Kepala Bidang', 'hashed_password_1', 1),
(2, 2, 1, 1, 'Siti Nurhaliza', '197805052000012002', 'siti@sekneg.go.id', 'Operator', 'hashed_password_2', 1),
(3, 3, 2, 3, 'Ahmad Wijaya', '198203151999021003', 'ahmad@kemendikbud.go.id', 'Staf IT', 'hashed_password_3', 1),
(4, 3, 3, 4, 'Rina Kusuma', '198506202001012001', 'rina@kemenkes.go.id', 'Analyst', 'hashed_password_4', 1),
(5, 4, 1, 2, 'Doni Pratama', '197903101995041005', 'doni@sekneg.go.id', 'Viewer', 'hashed_password_5', 1);

-- Sample Cara Akses
INSERT IGNORE INTO cara_akses (cara_akses_id, nama_cara_akses, status_aktif) VALUES 
(1, 'Web Browser', 1),
(2, 'Mobile App', 1),
(3, 'API', 1),
(4, 'Desktop Client', 1);

-- Sample Frekuensi Pemakaian
INSERT IGNORE INTO frekuensi_pemakaian (frekuensi_pemakaian_id, nama_frekuensi, status_aktif) VALUES 
(1, 'Setiap Hari', 1),
(2, 'Mingguan', 1),
(3, 'Bulanan', 1),
(4, 'Tahunan', 1);

-- Sample Status Aplikasi
INSERT IGNORE INTO status_aplikasi (status_aplikasi_id, nama_status) VALUES 
(1, 'Aktif'),
(2, 'Inactive'),
(3, 'Development'),
(4, 'Maintenance');

-- Sample PDN
INSERT IGNORE INTO pdn (pdn_id, kode_pdn, status_aktif) VALUES 
(1, 'PDN-001', 1),
(2, 'PDN-002', 1),
(3, 'PDN-003', 1);

-- Sample Environment
INSERT IGNORE INTO environment (environment_id, jenis_environment, status_aktif) VALUES 
(1, 'Production', 1),
(2, 'Staging', 1),
(3, 'Development', 1),
(4, 'Testing', 1);

-- Sample PIC Internal
INSERT IGNORE INTO pic_internal (pic_internal_id, eselon2_id, nama_pic_internal, kontak_pic_internal, status_aktif) VALUES 
(1, 1, 'Budi Santoso', '+62-21-1234567', 1),
(2, 1, 'Siti Nurhaliza', '+62-21-7654321', 1),
(3, 3, 'Ahmad Wijaya', '+62-274-123456', 1);

-- Sample PIC Eksternal
INSERT IGNORE INTO pic_eksternal (pic_eksternal_id, eselon2_id, nama_pic_eksternal, kontak_pic_eksternal, status_aktif) VALUES 
(1, 1, 'PT Telkom Indonesia', '+62-274-888999', 1),
(2, 3, 'Vendor IT Solutions', '+62-21-555666', 1);

-- Sample Data Aplikasi
INSERT IGNORE INTO data_aplikasi (
  nama_aplikasi, eselon1_id, eselon2_id, cara_akses_id, frekuensi_pemakaian,
  status_aplikasi, pdn_id, environment_id, pic_internal_id, pic_eksternal_id,
  domain, deskripsi_fungsi, bahasa_pemrograman, basis_data, status_bmn
) VALUES 
('Sistem Informasi Personalia', 1, 1, 1, 1, 1, 1, 1, 1, 1, 
 'sipersonalia.sekneg.go.id', 'Mengelola data pegawai dan payroll', 'Java', 'PostgreSQL', 'Aset BMN'),
('Portal Layanan Publik', 1, 1, 1, 1, 1, 2, 1, 2, 2, 
 'portal.sekneg.go.id', 'Portal informasi publik', 'PHP', 'MySQL', 'Aset BMN'),
('Sistem Keuangan Terpadu', 2, 3, 1, 2, 1, 1, 1, 3, 1, 
 'skt.kemendikbud.go.id', 'Manajemen keuangan dan anggaran', 'Python', 'Oracle', 'Aset BMN');

-- Sample Format Laporan
INSERT IGNORE INTO format_laporan (format_laporan_id, nama_aplikasi, nama_format, status_aktif) VALUES 
(1, 'Sistem Informasi Personalia', 'Laporan Payroll', 1),
(2, 'Portal Layanan Publik', 'Laporan Pengunjung', 1),
(3, 'Sistem Keuangan Terpadu', 'Laporan Anggaran', 1);

-- Sample Format Laporan Detail
INSERT IGNORE INTO format_laporan_detail (detail_id, format_laporan_id, field_name, label_tampilan, urutan) VALUES 
(1, 1, 'gaji_pokok', 'Gaji Pokok', 1),
(2, 1, 'tunjangan', 'Tunjangan', 2),
(3, 1, 'potongan', 'Potongan', 3),
(4, 2, 'tanggal_kunjungan', 'Tanggal Kunjungan', 1),
(5, 2, 'jumlah_pengunjung', 'Jumlah Pengunjung', 2),
(6, 3, 'unit_kerja', 'Unit Kerja', 1),
(7, 3, 'nominal_anggaran', 'Nominal Anggaran', 2);
