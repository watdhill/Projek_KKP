-- CreateTable
CREATE TABLE `cara_akses` (
    `cara_akses_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_cara_akses` VARCHAR(100) NOT NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`cara_akses_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_aplikasi` (
    `nama_aplikasi` VARCHAR(200) NOT NULL,
    `eselon1_id` BIGINT UNSIGNED NULL,
    `eselon2_id` BIGINT UNSIGNED NULL,
    `cara_akses_id` BIGINT UNSIGNED NULL,
    `frekuensi_pemakaian` BIGINT UNSIGNED NULL,
    `status_aplikasi` BIGINT UNSIGNED NULL,
    `pdn_id` BIGINT UNSIGNED NULL,
    `environment_id` BIGINT UNSIGNED NULL,
    `pic_internal_id` BIGINT UNSIGNED NULL,
    `pic_eksternal_id` BIGINT UNSIGNED NULL,
    `domain` VARCHAR(200) NULL,
    `deskripsi_fungsi` TEXT NULL,
    `user_pengguna` TEXT NULL,
    `data_digunakan` TEXT NULL,
    `luaran_output` TEXT NULL,
    `server_aplikasi` VARCHAR(200) NULL,
    `tipe_lisensi_bahasa` VARCHAR(200) NULL,
    `bahasa_pemrograman` VARCHAR(200) NULL,
    `basis_data` VARCHAR(200) NULL,
    `kerangka_pengembangan` VARCHAR(200) NULL,
    `unit_pengembang` VARCHAR(200) NULL,
    `unit_operasional_teknologi` VARCHAR(200) NULL,
    `nilai_pengembangan_aplikasi` VARCHAR(200) NULL,
    `pusat_komputasi_utama` VARCHAR(200) NULL,
    `pusat_komputasi_backup` VARCHAR(200) NULL,
    `mandiri_komputasi_backup` VARCHAR(200) NULL,
    `perangkat_lunak` TEXT NULL,
    `cloud` VARCHAR(200) NULL,
    `waf` VARCHAR(50) NULL,
    `antivirus` VARCHAR(50) NULL,
    `va_pt_status` VARCHAR(50) NULL,
    `va_pt_waktu` VARCHAR(100) NULL,
    `alamat_ip_publik` VARCHAR(100) NULL,
    `keterangan` TEXT NULL,
    `status_bmn` VARCHAR(100) NULL,
    `api_internal_status` VARCHAR(50) NULL,

    INDEX `cara_akses_id`(`cara_akses_id`),
    INDEX `environment_id`(`environment_id`),
    INDEX `eselon1_id`(`eselon1_id`),
    INDEX `eselon2_id`(`eselon2_id`),
    INDEX `frekuensi_pemakaian`(`frekuensi_pemakaian`),
    INDEX `pdn_id`(`pdn_id`),
    INDEX `pic_eksternal_id`(`pic_eksternal_id`),
    INDEX `pic_internal_id`(`pic_internal_id`),
    INDEX `status_aplikasi`(`status_aplikasi`),
    PRIMARY KEY (`nama_aplikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `environment` (
    `environment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `jenis_environment` VARCHAR(100) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`environment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `format_laporan` (
    `format_laporan_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_aplikasi` VARCHAR(200) NOT NULL,
    `nama_format` VARCHAR(200) NOT NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    INDEX `nama_aplikasi`(`nama_aplikasi`),
    PRIMARY KEY (`format_laporan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `format_laporan_detail` (
    `detail_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `format_laporan_id` BIGINT UNSIGNED NOT NULL,
    `field_name` VARCHAR(100) NOT NULL,
    `label_tampilan` VARCHAR(150) NOT NULL,
    `urutan` INTEGER NOT NULL,

    INDEX `format_laporan_id`(`format_laporan_id`),
    PRIMARY KEY (`detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `frekuensi_pemakaian` (
    `frekuensi_pemakaian_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_frekuensi` VARCHAR(100) NOT NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`frekuensi_pemakaian_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_eselon1` (
    `eselon1_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_eselon1` VARCHAR(200) NOT NULL,
    `singkatan` VARCHAR(50) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`eselon1_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_eselon2` (
    `eselon2_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `eselon1_id` BIGINT UNSIGNED NOT NULL,
    `nama_eselon2` VARCHAR(200) NOT NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    INDEX `eselon1_id`(`eselon1_id`),
    PRIMARY KEY (`eselon2_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pdn` (
    `pdn_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `kode_pdn` VARCHAR(100) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`pdn_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pic_eksternal` (
    `pic_eksternal_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `eselon2_id` BIGINT UNSIGNED NULL,
    `nama_pic_eksternal` VARCHAR(150) NULL,
    `kontak_pic_eksternal` VARCHAR(150) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    INDEX `eselon2_id`(`eselon2_id`),
    PRIMARY KEY (`pic_eksternal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pic_internal` (
    `pic_internal_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `eselon2_id` BIGINT UNSIGNED NULL,
    `nama_pic_internal` VARCHAR(150) NULL,
    `kontak_pic_internal` VARCHAR(150) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    INDEX `eselon2_id`(`eselon2_id`),
    PRIMARY KEY (`pic_internal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_role` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_aplikasi` (
    `status_aplikasi_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_status` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`status_aplikasi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `eselon1_id` BIGINT UNSIGNED NULL,
    `eselon2_id` BIGINT UNSIGNED NULL,
    `nama` VARCHAR(150) NULL,
    `nip` VARCHAR(50) NULL,
    `email` VARCHAR(150) NULL,
    `jabatan` VARCHAR(150) NULL,
    `password` VARCHAR(255) NULL,
    `status_aktif` BOOLEAN NULL DEFAULT true,

    INDEX `eselon1_id`(`eselon1_id`),
    INDEX `eselon2_id`(`eselon2_id`),
    INDEX `role_id`(`role_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_1` FOREIGN KEY (`eselon1_id`) REFERENCES `master_eselon1`(`eselon1_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_2` FOREIGN KEY (`eselon2_id`) REFERENCES `master_eselon2`(`eselon2_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_3` FOREIGN KEY (`cara_akses_id`) REFERENCES `cara_akses`(`cara_akses_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_4` FOREIGN KEY (`frekuensi_pemakaian`) REFERENCES `frekuensi_pemakaian`(`frekuensi_pemakaian_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_5` FOREIGN KEY (`status_aplikasi`) REFERENCES `status_aplikasi`(`status_aplikasi_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_6` FOREIGN KEY (`pdn_id`) REFERENCES `pdn`(`pdn_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_7` FOREIGN KEY (`environment_id`) REFERENCES `environment`(`environment_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_8` FOREIGN KEY (`pic_internal_id`) REFERENCES `pic_internal`(`pic_internal_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `data_aplikasi` ADD CONSTRAINT `data_aplikasi_ibfk_9` FOREIGN KEY (`pic_eksternal_id`) REFERENCES `pic_eksternal`(`pic_eksternal_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `format_laporan` ADD CONSTRAINT `format_laporan_ibfk_1` FOREIGN KEY (`nama_aplikasi`) REFERENCES `data_aplikasi`(`nama_aplikasi`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `format_laporan_detail` ADD CONSTRAINT `format_laporan_detail_ibfk_1` FOREIGN KEY (`format_laporan_id`) REFERENCES `format_laporan`(`format_laporan_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `master_eselon2` ADD CONSTRAINT `master_eselon2_ibfk_1` FOREIGN KEY (`eselon1_id`) REFERENCES `master_eselon1`(`eselon1_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pic_eksternal` ADD CONSTRAINT `pic_eksternal_ibfk_1` FOREIGN KEY (`eselon2_id`) REFERENCES `master_eselon2`(`eselon2_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pic_internal` ADD CONSTRAINT `pic_internal_ibfk_1` FOREIGN KEY (`eselon2_id`) REFERENCES `master_eselon2`(`eselon2_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`eselon1_id`) REFERENCES `master_eselon1`(`eselon1_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`eselon2_id`) REFERENCES `master_eselon2`(`eselon2_id`) ON DELETE SET NULL ON UPDATE RESTRICT;

