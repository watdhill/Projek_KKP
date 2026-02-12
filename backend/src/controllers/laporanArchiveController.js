const pool = require("../config/database");

/**
 * ============================================
 * LAYER 1 & 2: FORMAT & DATA ARCHIVE OPERATIONS
 * ============================================
 * Controller untuk manage archiving format laporan dan data aplikasi
 */

/**
 * Archive format laporan for a specific year
 * POST /api/laporan/archive/format/:year
 */
exports.archiveFormat = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { year } = req.params;
    const notes = req.body?.notes || null;
    const user_id = req.user?.user_id || 1; // From auth middleware

    await connection.beginTransaction();

    // Validation
    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter",
      });
    }

    // Check if already archived
    const [existing] = await connection.query(
      "SELECT archive_id FROM format_laporan_archive WHERE tahun_archive = ?",
      [year]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Format laporan untuk tahun ${year} sudah di-archive`,
      });
    }

    // Get all active format laporan
    const [formats] = await connection.query(`
      SELECT 
        format_laporan_id,
        nama_format,
        status_aktif
      FROM format_laporan
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);

    if (formats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada format laporan aktif untuk di-archive",
      });
    }

    let archivedCount = 0;
    let archivedDetailsCount = 0;

    // Archive each format
    for (const format of formats) {
      // Insert format archive
      const [archiveResult] = await connection.query(
        `
        INSERT INTO format_laporan_archive 
        (tahun_archive, format_laporan_id, nama_format, field_ids, status_at_archive, archived_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          year,
          format.format_laporan_id,
          format.nama_format,
          null,
          format.status_aktif ? "aktif" : "non-aktif",
          user_id,
          notes || null,
        ]
      );

      const archive_id = archiveResult.insertId;
      archivedCount++;

      // Get format details (fields)
      const [details] = await connection.query(
        `
        SELECT 
          fd.field_id,
          mf.nama_field,
          mf.kode_field,
          mf.level,
          mf.parent_id,
          fd.order_index
        FROM format_laporan_detail fd
        JOIN master_laporan_field mf ON fd.field_id = mf.field_id
        WHERE fd.format_laporan_id = ?
        ORDER BY fd.order_index
      `,
        [format.format_laporan_id]
      );

      // Insert detail archives
      for (const detail of details) {
        await connection.query(
          `
          INSERT INTO format_laporan_detail_archive 
          (archive_id, field_id, field_name, kode_field, level, parent_id, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            archive_id,
            detail.field_id,
            detail.nama_field,
            detail.kode_field,
            detail.level,
            detail.parent_id,
            detail.order_index,
          ]
        );
        archivedDetailsCount++;
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Format laporan tahun ${year} berhasil di-archive`,
      data: {
        year,
        formats_archived: archivedCount,
        fields_archived: archivedDetailsCount,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Archive format error:", error);
    res.status(500).json({
      success: false,
      message: "Error archiving format laporan",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Archive data aplikasi for a specific year
 * POST /api/laporan/archive/data/:year
 */
exports.archiveData = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { year } = req.params;
    const trigger = req.body?.trigger || "manual";
    const user_id = req.user?.user_id || 1;

    await connection.beginTransaction();

    // Validation
    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter",
      });
    }

    // Check if already archived
    const [existing] = await connection.query(
      "SELECT COUNT(*) as count FROM data_aplikasi_archive WHERE archive_year = ?",
      [year]
    );

    if (existing[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Data aplikasi tahun ${year} sudah di-archive (${existing[0].count} records)`,
      });
    }

    // Get all data aplikasi
    // For current year, archive all
    // For past years, archive data created in that year
    const yearCondition =
      parseInt(year) === new Date().getFullYear()
        ? "" // Current year: archive all
        : `WHERE YEAR(created_at) = ${year}`; // Past year: by created date

    const [dataAplikasi] = await connection.query(`
      SELECT 
        nama_aplikasi as original_id,
        nama_aplikasi,
        status_aplikasi as status,
        eselon1_id,
        eselon2_id,
        upt_id,
        environment_id,
        domain as domain_aplikasi,
        cara_akses_multiple as cara_akses,
        pic_internal,
        pic_eksternal,
        kontak_pic_internal,
        kontak_pic_eksternal,
        cloud as penyedia_hosting,
        waf as keamanan_aplikasi,
        \`ssl\` as sertifikat_ssl,
        ssl_expired as ssl_expired_date,
        waf_lainnya,
        akses_aplikasi_username as username,
        akses_aplikasi_password_enc as password,
        basis_data as database_aplikasi,
        pdn_backup,
        unit_pengembang as pihak_ketiga,
        perangkat_lunak as integrasi_lain,
        deskripsi_fungsi as penjelasan_aplikasi,
        keterangan
      FROM data_aplikasi
      ${yearCondition}
    `);

    if (dataAplikasi.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data aplikasi untuk tahun ${year}`,
      });
    }

    // Insert archived data
    let archivedCount = 0;
    for (const app of dataAplikasi) {
      await connection.query(
        `
        INSERT INTO data_aplikasi_archive 
        (archive_year, original_id, nama_aplikasi, status, eselon1_id, eselon2_id, 
         upt_id, environment_id, domain_aplikasi, cara_akses, pic_internal, pic_eksternal,
         kontak_pic_internal, kontak_pic_eksternal, penyedia_hosting, keamanan_aplikasi,
         sertifikat_ssl, ssl_expired_date, waf_lainnya, username, password,
         database_aplikasi, pdn_backup, pihak_ketiga, integrasi_lain,
         penjelasan_aplikasi, keterangan, archived_by, archive_trigger)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          year,
          app.original_id,
          app.nama_aplikasi,
          app.status,
          app.eselon1_id,
          app.eselon2_id,
          app.upt_id,
          app.environment_id,
          app.domain_aplikasi,
          app.cara_akses || null,  // Already JSON or null
          app.pic_internal,
          app.pic_eksternal,
          app.kontak_pic_internal ? JSON.stringify({phone: app.kontak_pic_internal}) : null,
          app.kontak_pic_eksternal ? JSON.stringify({phone: app.kontak_pic_eksternal}) : null,
          app.penyedia_hosting,
          app.keamanan_aplikasi,
          app.sertifikat_ssl,
          app.ssl_expired_date,
          app.waf_lainnya,
          app.username,
          app.password,
          app.database_aplikasi,
          app.pdn_backup,
          app.pihak_ketiga,
          app.integrasi_lain,
          app.penjelasan_aplikasi,
          app.keterangan,
          user_id,
          trigger,
        ]
      );
      archivedCount++;
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Data aplikasi tahun ${year} berhasil di-archive`,
      data: {
        year,
        applications_archived: archivedCount,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Archive data error:", error);
    res.status(500).json({
      success: false,
      message: "Error archiving data aplikasi",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Get list of all archives with summary
 * GET /api/laporan/archive/list
 */
exports.listArchives = async (req, res) => {
  try {
    // Get format archives grouped by year
    const [formatArchives] = await pool.query(`
      SELECT 
        tahun_archive,
        COUNT(DISTINCT archive_id) as format_count,
        COUNT(DISTINCT format_laporan_id) as unique_formats,
        MIN(archived_at) as first_archived,
        MAX(archived_at) as last_archived
      FROM format_laporan_archive
      GROUP BY tahun_archive
      ORDER BY tahun_archive DESC
    `);

    // Get data archives grouped by year
    const [dataArchives] = await pool.query(`
      SELECT 
        archive_year,
        COUNT(*) as application_count,
        MIN(archived_at) as first_archived,
        MAX(archived_at) as last_archived
      FROM data_aplikasi_archive
      GROUP BY archive_year
      ORDER BY archive_year DESC
    `);

    // Get snapshot count by year
    const [snapshotCounts] = await pool.query(`
      SELECT 
        snapshot_year,
        COUNT(*) as snapshot_count,
        SUM(file_size) as total_size
      FROM laporan_snapshots
      GROUP BY snapshot_year
      ORDER BY snapshot_year DESC
    `);

    // Combine data
    const years = [
      ...new Set([
        ...formatArchives.map((f) => f.tahun_archive),
        ...dataArchives.map((d) => d.archive_year),
        ...snapshotCounts.map((s) => s.snapshot_year),
      ]),
    ].sort((a, b) => b - a);

    const archives = years.map((year) => {
      const formatArchive = formatArchives.find((f) => f.tahun_archive === year);
      const dataArchive = dataArchives.find((d) => d.archive_year === year);
      const snapshots = snapshotCounts.find((s) => s.snapshot_year === year);

      return {
        year,
        has_format_archive: !!formatArchive,
        has_data_archive: !!dataArchive,
        format_count: formatArchive?.format_count || 0,
        application_count: dataArchive?.application_count || 0,
        snapshot_count: snapshots?.snapshot_count || 0,
        total_snapshot_size: snapshots?.total_size || 0,
        status:
          formatArchive && dataArchive
            ? "complete"
            : formatArchive || dataArchive
              ? "partial"
              : "snapshots-only",
      };
    });

    res.json({
      success: true,
      data: archives,
    });
  } catch (error) {
    console.error("List archives error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching archives",
      error: error.message,
    });
  }
};

/**
 * Get archived formats for specific year
 * GET /api/laporan/archive/:year/formats
 */
exports.getArchivedFormats = async (req, res) => {
  try {
    const { year } = req.params;

    const [formats] = await pool.query(
      `
      SELECT 
        fa.archive_id,
        fa.format_laporan_id,
        fa.nama_format,
        fa.field_ids,
        fa.status_at_archive,
        fa.archived_at,
        fa.notes,
        u.nama as archived_by_username,
        COUNT(fda.archive_detail_id) as field_count
      FROM format_laporan_archive fa
      LEFT JOIN users u ON fa.archived_by = u.user_id
      LEFT JOIN format_laporan_detail_archive fda ON fa.archive_id = fda.archive_id
      WHERE fa.tahun_archive = ?
      GROUP BY fa.archive_id
      ORDER BY fa.nama_format
    `,
      [year]
    );

    if (formats.length === 0) {
      // Return empty array instead of 404 to avoid frontend error
      return res.json({
        success: true,
        message: `Tidak ada format archive untuk tahun ${year}`,
        data: [],
      });
    }

    res.json({
      success: true,
      data: formats,
    });
  } catch (error) {
    console.error("Get archived formats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching archived formats",
      error: error.message,
    });
  }
};

/**
 * Get archived data count for specific year
 * GET /api/laporan/archive/:year/data
 */
exports.getArchivedDataCount = async (req, res) => {
  try {
    const { year } = req.params;

    const [result] = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT status) as status_count,
        COUNT(DISTINCT eselon2_id) as eselon2_count,
        COUNT(DISTINCT upt_id) as upt_count
      FROM data_aplikasi_archive
      WHERE archive_year = ?
    `,
      [year]
    );

    if (result[0].total === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data archive untuk tahun ${year}`,
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Get archived data error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching archived data",
      error: error.message,
    });
  }
};

/**
 * Delete archive (format + data) for specific year
 * DELETE /api/laporan/archive/:year
 */
exports.deleteArchive = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { year } = req.params;

    await connection.beginTransaction();

    // Delete format archives (cascade will delete details)
    const [formatResult] = await connection.query(
      "DELETE FROM format_laporan_archive WHERE tahun_archive = ?",
      [year]
    );

    // Delete data archives
    const [dataResult] = await connection.query(
      "DELETE FROM data_aplikasi_archive WHERE archive_year = ?",
      [year]
    );

    if (formatResult.affectedRows === 0 && dataResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Tidak ada archive untuk tahun ${year}`,
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Archive tahun ${year} berhasil dihapus`,
      data: {
        formats_deleted: formatResult.affectedRows,
        data_deleted: dataResult.affectedRows,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete archive error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting archive",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Get available formats for a specific year from archive
 * GET /api/laporan/archive/formats/:year
 */
exports.getAvailableFormats = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { year } = req.params;
    
    // Validation
    if (!year || isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter",
      });
    }

    // Get archived formats for the year
    const [formats] = await connection.query(`
      SELECT 
        format_laporan_id,
        nama_format,
        created_by,
        archived_at
      FROM format_laporan_archive 
      WHERE tahun_archive = ?
      ORDER BY nama_format ASC
    `, [year]);

    return res.status(200).json({
      success: true,
      message: `Found ${formats.length} archived formats for year ${year}`,
      data: formats,
    });

  } catch (error) {
    console.error("Get available formats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available formats",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
