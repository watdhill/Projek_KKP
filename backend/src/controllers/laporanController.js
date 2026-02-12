const pool = require("../config/database");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { decryptAkunPassword } = require("../utils/fieldEncryption");

// ============================================
// FIELD NAME MAPPING
// ============================================

/**
 * Map kode_field from master_laporan_field to actual column names in data_aplikasi
 * This is needed because some kode_field values don't match the actual database columns
 */
function mapFieldName(kodeField) {
  const fieldMapping = {
    // PDN fields
    pdn_utama: "pdn_id",
    pusat_komputasi_utama_pdn: "pdn_id",

    // PDN Backup - maps to actual pdn_backup column
    pdn_backup: "pdn_backup",

    // Mandiri field
    mandiri: "mandiri_komputasi_backup",
    mandiri_backup: "mandiri_komputasi_backup",

    // API fields
    api_internal_integrasi: "api_internal_status",
    api_internal_sistem_integrasi: "api_internal_status",

    // VA/PT fields
    va_pt: "va_pt_status",
    va_pt_ya_tidak: "va_pt_status",
    ya_tidak: "va_pt_status",
    waktu_va_pt: "va_pt_waktu",
    waktu: "va_pt_waktu",

    // Keamanan SSL field from hierarchical seed
    api_internal_status_ssl: "ssl",

    // PIC contact fields (these don't exist in data_aplikasi)
    kontak_pic_internal: null, // No column for this
    kontak_pic_eksternal: null, // No column for this

    // Missing mappings identified during debug
    eselon_1: "nama_eselon1",
    eselon_2: "nama_eselon2",
    framework: "kerangka_pengembangan",
    frekuensi_update_data: "frekuensi_pemakaian",

    // Dynamic master table FK mappings
    eselon1_id: "eselon1_id",
    eselon2_id: "eselon2_id",
    upt_id: "upt_id",
    cara_akses_id: "cara_akses_id",
    frekuensi_pemakaian_id: "frekuensi_pemakaian",
    status_aplikasi_id: "status_aplikasi",
    environment_id: "environment_id",
    pic_internal_id: "pic_internal_id",
    pic_eksternal_id: "pic_eksternal_id",

    // Default: return as-is
  };

  return fieldMapping[kodeField] || kodeField;
}

// ============================================
// HELPER FUNCTIONS FOR HIERARCHICAL EXPORT
// ============================================

/**
 * Parse hierarchical label using '>' delimiter
 * Example: "Arsitektur Infrastruktur > Fasilitas Komputasi Utama"
 * Returns: { judul: "Arsitektur Infrastruktur", subJudul: "Fasilitas Komputasi Utama", fieldLabel: "Fasilitas Komputasi Utama" }
 */
function parseHierarchicalLabel(labelTampilan) {
  if (!labelTampilan)
    return { judul: null, subJudul: null, fieldLabel: labelTampilan };

  const parts = labelTampilan.split(">").map((s) => s.trim());

  if (parts.length === 1) {
    // No hierarchy, just field label
    return { judul: null, subJudul: null, fieldLabel: parts[0] };
  } else if (parts.length === 2) {
    // Judul > Field
    return { judul: parts[0], subJudul: null, fieldLabel: parts[1] };
  } else {
    // Judul > SubJudul > Field
    return {
      judul: parts[0],
      subJudul: parts[1],
      fieldLabel: parts[2] || parts[1],
    };
  }
}

/**
 * Build hierarchy from master_laporan_field tree structure
 * Uses parent_id and level from master_laporan_field to build proper hierarchy
 */
async function buildHierarchyFromMasterField(formatDetails) {
  const structure = [];

  // Get all field_ids from formatDetails
  const fieldIds = formatDetails
    .filter((d) => d.field_id)
    .map((d) => d.field_id);

  if (fieldIds.length === 0) {
    return structure;
  }

  // Create Order Map from format details
  const orderMap = new Map();
  formatDetails.forEach((d) => {
    if (d.field_id) orderMap.set(d.field_id, d.order_index);
  });

  // Query ALL master_laporan_field to ensure parents/hierarchy exists
  const [allFields] = await pool.query(`
    SELECT field_id, nama_field, kode_field, parent_id, level, urutan
    FROM master_laporan_field
  `);

  // Build tree structure
  const fieldMap = new Map();
  allFields.forEach((field) => {
    fieldMap.set(field.field_id, {
      ...field,
      children: [],
      // Set own order
      ownOrder: orderMap.has(field.field_id)
        ? orderMap.get(field.field_id)
        : 999999,
    });
  });

  // Link children to parents
  const roots = [];
  allFields.forEach((field) => {
    const node = fieldMap.get(field.field_id);
    if (field.parent_id && fieldMap.has(field.parent_id)) {
      fieldMap.get(field.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Calculate Effective Order and Sort Tree
  function processAndSortNode(node) {
    let minOrder = node.ownOrder;

    if (node.children && node.children.length > 0) {
      const childOrders = node.children.map((child) =>
        processAndSortNode(child),
      );
      const minChildOrder = Math.min(...childOrders);
      if (minChildOrder < minOrder) minOrder = minChildOrder;

      node.children.sort((a, b) => a.effectiveOrder - b.effectiveOrder);
    }

    node.effectiveOrder = minOrder;
    return minOrder;
  }

  roots.forEach((root) => processAndSortNode(root));
  roots.sort((a, b) => a.effectiveOrder - b.effectiveOrder);

  // Convert tree to export structure
  function convertToExportStructure(nodes) {
    const result = [];

    nodes.forEach((node) => {
      const nodeIsSelected = fieldIds.includes(node.field_id);

      if (node.level === 1) {
        // Level 1: Judul (Header Group)
        const group = {
          type: "group",
          judul: node.nama_field,
          subGroups: new Map(),
          fields: [],
        };

        // Process children (Level 2/3)
        node.children.forEach((child) => {
          if (child.level === 2) {
            // Sub-Judul
            const subFields = child.children
              .filter((f) => f.level === 3 && fieldIds.includes(f.field_id))
              .map((f) => ({
                label: f.nama_field,
                fieldName: mapFieldName(f.kode_field),
              }));

            if (subFields.length > 0) {
              group.subGroups.set(child.nama_field, subFields);
            }
          } else if (child.level === 3 && fieldIds.includes(child.field_id)) {
            // Direct field under Judul (no sub-judul)
            group.fields.push({
              label: child.nama_field,
              fieldName: mapFieldName(child.kode_field),
            });
          }
        });

        // Add group if it has fields OR it's a header without children (if selected)
        if (group.subGroups.size > 0 || group.fields.length > 0) {
          result.push(group);
        } else if (nodeIsSelected && node.kode_field) {
          // Treat as regular field if it has a kode_field but no children selected
          result.push({
            type: "field",
            label: node.nama_field,
            fieldName: mapFieldName(node.kode_field),
          });
        }
      } else if (node.level === 2) {
        // Level 2 (Sub-Judul) as root
        const subFields = node.children
          .filter((f) => f.level === 3 && fieldIds.includes(f.field_id))
          .map((f) => ({
            label: f.nama_field,
            fieldName: mapFieldName(f.kode_field),
          }));

        if (subFields.length > 0) {
          result.push({
            type: "group",
            judul: node.nama_field,
            subGroups: new Map(),
            fields: subFields,
          });
        } else if (nodeIsSelected && node.kode_field) {
          result.push({
            type: "field",
            label: node.nama_field,
            fieldName: mapFieldName(node.kode_field),
          });
        }
      } else if (node.level === 3 && nodeIsSelected) {
        // Level 3 (Data Field) as root
        result.push({
          type: "field",
          label: node.nama_field,
          fieldName: mapFieldName(node.kode_field),
        });
      }
    });

    return result;
  }

  return convertToExportStructure(roots, true);
}

/**
 * Get format laporan details with hierarchical structure
 */
async function getFormatDetails(formatId) {
  const [details] = await pool.query(
    `
    SELECT 
      fld.id,
      fld.format_laporan_id,
      fld.parent_id,
      fld.judul,
      fld.is_header,
      mlf.kode_field as field_name,
      mlf.nama_field as label_tampilan,
      fld.field_id,
      fld.id as order_index,
      COALESCE(mlf.urutan, 999) as urutan
    FROM format_laporan_detail fld
    LEFT JOIN master_laporan_field mlf ON fld.field_id = mlf.field_id
    WHERE fld.format_laporan_id = ?
    ORDER BY fld.id ASC
  `,
    [formatId],
  );

  return details;
}

// Get all format laporan for dropdown
exports.getAllFormatLaporan = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT nama_format, format_laporan_id 
      FROM format_laporan 
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil format laporan",
      error: error.message,
    });
  }
};

// Get format fields for preview (new endpoint)
exports.getFormatFieldsForPreview = async (req, res) => {
  try {
    const { format_laporan_id } = req.query;

    if (!format_laporan_id) {
      return res.status(400).json({
        success: false,
        message: "format_laporan_id required",
      });
    }

    const [fields] = await pool.query(
      `
      SELECT 
        fld.id,
        fld.parent_id,
        fld.judul,
        fld.is_header,
        mlf.kode_field,
        mlf.nama_field,
        mlf.urutan,
        fld.field_id,
        fld.id as order_index
      FROM format_laporan_detail fld
      LEFT JOIN master_laporan_field mlf ON fld.field_id = mlf.field_id
      WHERE fld.format_laporan_id = ?
      ORDER BY fld.id ASC
    `,
      [format_laporan_id],
    );

    res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching format fields",
      error: error.message,
    });
  }
};

// Helper: Get Cara Akses Map (ID -> Name)
async function getCaraAksesMap() {
  const [rows] = await pool.query(
    "SELECT cara_akses_id, nama_cara_akses FROM cara_akses",
  );
  const map = {};
  rows.forEach((r) => {
    map[r.cara_akses_id] = r.nama_cara_akses;
  });
  return map;
}

// Get preview data with filters
exports.getPreviewData = async (req, res) => {
  try {
    const { format_laporan_id, status, eselon1_id, eselon2_id } = req.query;

    const caraAksesMap = await getCaraAksesMap();

    let query = `
      SELECT 
        da.nama_aplikasi,
        e1.nama_eselon1 as eselon_1,
        e1.singkatan as unit,
        e2.nama_eselon2 as eselon_2,
        
        /* PIC Logic: Fetch from master tables via FK */
        pi.nama_pic_internal as pic_internal_master,
        pi.kontak_pic_internal as kontak_pic_internal_master,
        pe.nama_pic_eksternal as pic_eksternal_master,
        pe.kontak_pic_eksternal as kontak_pic_eksternal_master,

        da.pic_internal,
        da.pic_eksternal,
        da.kontak_pic_internal,
        da.kontak_pic_eksternal,

        /* PDN & Mandiri Aliases */
        pd1.kode_pdn as pdn_utama,
        da.pdn_backup as pdn_backup,
        da.mandiri_komputasi_backup as mandiri,
        da.mandiri_komputasi_backup as mandiri_backup,

        sa.nama_status as status_aplikasi,
        DATE_FORMAT(da.created_at, '%Y-%m-%d') as tanggal_ditambahkan,
        YEAR(COALESCE(da.updated_at, da.created_at)) as tahun_pengembangan,
        da.domain,
        da.deskripsi_fungsi,
        da.user_pengguna,
        da.data_digunakan,
        da.luaran_output,
        da.bahasa_pemrograman,
        da.basis_data,
        da.kerangka_pengembangan,
        da.kerangka_pengembangan as framework,
        da.unit_pengembang,
        da.unit_operasional_teknologi,
        da.nilai_pengembangan_aplikasi,
        da.pusat_komputasi_utama,
        da.pusat_komputasi_backup,
        da.mandiri_komputasi_backup,
        da.perangkat_lunak,
        da.cloud,
        da.waf,
        da.antivirus,
        da.va_pt_status,
        da.va_pt_waktu,
        da.alamat_ip_publik,
        da.keterangan,
        da.status_bmn,
        da.server_aplikasi,
        da.tipe_lisensi_bahasa,
        da.api_internal_status as api_internal_integrasi,
        da.ssl,
        da.ssl_expired,
        env.jenis_environment as ekosistem,
        env.jenis_environment as environment_id,
        da.waf_lainnya,
        da.akses_aplikasi_username,
        da.akses_aplikasi_password_enc,
        da.cara_akses_multiple,
        fp.nama_frekuensi as frekuensi_update_data
      FROM data_aplikasi da
      LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
      LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
      LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN pic_internal pi ON da.pic_internal_id = pi.pic_internal_id
      LEFT JOIN pic_eksternal pe ON da.pic_eksternal_id = pe.pic_eksternal_id
      LEFT JOIN pdn pd1 ON da.pdn_id = pd1.pdn_id
      LEFT JOIN frekuensi_pemakaian fp ON da.frekuensi_pemakaian = fp.frekuensi_pemakaian
      LEFT JOIN environment env ON da.environment_id = env.environment_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== "all") {
      query += ` AND da.status_aplikasi = ?`;
      params.push(status);
    }

    if (eselon1_id && eselon1_id !== "all") {
      query += ` AND da.eselon1_id = ?`;
      params.push(eselon1_id);
    }

    if (eselon2_id && eselon2_id !== "all") {
      query += ` AND da.eselon2_id = ?`;
      params.push(eselon2_id);
    }

    // Add UPT Filter
    const { upt_id } = req.query;
    if (upt_id && upt_id !== "all") {
      query += ` AND da.upt_id = ?`;
      params.push(upt_id);
    }

    // Order by Eselon hierarchy (Setjen first), then by application name
    query += ` ORDER BY e1.eselon1_id ASC, e2.nama_eselon2 ASC, da.nama_aplikasi ASC`;

    const [rows] = await pool.query(query, params);

    // Post-process rows
    const formattedRows = rows.map((row) => {
      // Parse Cara Akses Multiple
      let caraAksesStr = "";
      if (row.cara_akses_multiple) {
        try {
          // Try to parse as JSON array if it looks like one, otherwise assume comma-separated string
          let ids = [];
          if (
            typeof row.cara_akses_multiple === "string" &&
            row.cara_akses_multiple.startsWith("[")
          ) {
            ids = JSON.parse(row.cara_akses_multiple);
          } else if (typeof row.cara_akses_multiple === "string") {
            ids = row.cara_akses_multiple.split(",").map((s) => s.trim());
          } else if (Array.isArray(row.cara_akses_multiple)) {
            ids = row.cara_akses_multiple;
          }

          caraAksesStr = ids.map((id) => caraAksesMap[id] || id).join(", ");
        } catch (e) {
          console.error("Error parsing cara_akses_multiple:", e);
          caraAksesStr = row.cara_akses_multiple;
        }
      }

      // Use Master PIC if available, fall back to direct field
      const picInternal = row.pic_internal_master || row.pic_internal;
      const picEksternal = row.pic_eksternal_master || row.pic_eksternal;
      const kontakPicInternal =
        row.kontak_pic_internal_master || row.kontak_pic_internal;
      const kontakPicEksternal =
        row.kontak_pic_eksternal_master || row.kontak_pic_eksternal;

      // WAF Logic
      let wafValue = row.waf;
      const wafLower = (wafValue || "").toLowerCase().trim();
      
      // If "Lainnya" or "WAF - Lainnya", prefer the content of waf_lainnya
      if (
        wafLower === "lainnya" || 
        wafLower === "waf - lainnya" || 
        wafLower === "waf-lainnya"
      ) {
         // Use waf_lainnya if available, otherwise keep original value (e.g. "Lainnya")
         if (row.waf_lainnya && row.waf_lainnya.trim() !== "" && row.waf_lainnya !== "-") {
             wafValue = row.waf_lainnya;
         }
      }

      // SSL Logic
      let sslValue = row.ssl;
      if (row.ssl === 1 || row.ssl === '1') sslValue = 'Ya';
      if (row.ssl === 0 || row.ssl === '0') sslValue = 'Tidak';

      // Decrypt Password
      let password = row.akses_aplikasi_password_enc;
      try {
        if (password) {
          password = decryptAkunPassword(password);
        }
      } catch (err) {
        console.error("Error decrypting password for app:", row.nama_aplikasi, err);
        // Fallback or leave as encrypted if failure, or set to error message
        password = "(Error Decrypting)"; 
      }

      return {
        ...row,
        waf: wafValue,
        waf_lainnya: wafValue, // Map 'waf_lainnya' to the resolved value so if preview uses this column it gets the real value
        ssl: sslValue,
        cara_akses: caraAksesStr, // Standardize to 'cara_akses' field expected by frontend
        pic_internal: picInternal,
        pic_eksternal: picEksternal,
        kontak_pic_internal: kontakPicInternal,
        kontak_pic_eksternal: kontakPicEksternal,
        akses_aplikasi_password_enc: password, // Send decrypted password
        password_akses_aplikasi: password, // Map to frontend friendly name if needed
        mandiri_komputasi: row.mandiri_komputasi_backup, // Ensure this alias exists
        mandiri_backup: row.mandiri_komputasi_backup, // Ensure this alias exists
        mandiri: row.mandiri_komputasi_backup // Ensure this alias exists
      };
    });

    res.json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil preview data",
      error: error.message,
    });
  }
};

// Export to Excel with hierarchical headers
exports.exportExcel = async (req, res) => {
  try {
    const { format_laporan_id, tahun, status, eselon1_id, eselon2_id, upt_id } =
      req.query;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KKP System";
    workbook.created = new Date();

    // Check if "all formats" is selected
    const isAllFormats = format_laporan_id === "all";

    let formats = [];
    if (isAllFormats) {
      // Get all active formats
      const [allFormats] = await pool.query(`
        SELECT DISTINCT format_laporan_id, nama_format
        FROM format_laporan
        WHERE status_aktif = 1
        ORDER BY nama_format
      `);
      formats = allFormats;
    } else if (format_laporan_id) {
      // Get single format
      const [singleFormat] = await pool.query(
        `
        SELECT format_laporan_id, nama_format
        FROM format_laporan
        WHERE format_laporan_id = ?
      `,
        [format_laporan_id],
      );
      formats = singleFormat;
    }

    const filters = { tahun, status, eselon1_id, eselon2_id, upt_id };

    // If no format specified, use default columns
    if (formats.length === 0) {
      await createDefaultSheet(workbook, filters);
    } else {
      // Create sheet for each format
      for (const format of formats) {
        await createFormatSheet(workbook, format, filters);
      }
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    const filename = isAllFormats
      ? `Laporan_Semua_Format_${new Date().toISOString().split("T")[0]}.xlsx`
      : `Laporan_${formats[0]?.nama_format || "Aplikasi"}_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Export Excel error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating Excel file",
      error: error.message,
    });
  }
};

// Export All Formats as Excel (Multiple Sheets)
exports.exportExcelAll = async (req, res) => {
  try {
    const { tahun, status, eselon1_id, eselon2_id, upt_id } = req.query;
    const filters = { tahun, status, eselon1_id, eselon2_id, upt_id };

    // Fetch all active formats
    const [formats] = await pool.query(`
      SELECT format_laporan_id, nama_format 
      FROM format_laporan 
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);

    if (formats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada format laporan aktif",
      });
    }

    const workbook = new ExcelJS.Workbook();

    // Create worksheet for each format
    for (const format of formats) {
      // Create sheet using existing helper function
      await createFormatSheet(workbook, format, filters);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Build filename with filters
    let filenameParts = ["Semua_Format_Laporan"];
    if (tahun && tahun !== "all") filenameParts.push(tahun);
    if (status && status !== "all") filenameParts.push("Status" + status);
    if (eselon1_id && eselon1_id !== "all")
      filenameParts.push("Eselon1_" + eselon1_id);
    if (upt_id && upt_id !== "all") filenameParts.push("UPT_" + upt_id);

    const filename = `${filenameParts.join("_")}_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Export Excel All error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating Excel file with all formats",
      error: error.message,
    });
  }
};

// Helper: Create sheet with default columns
async function createDefaultSheet(workbook, filters) {
  const worksheet = workbook.addWorksheet("Laporan Aplikasi");

  // Default columns
  worksheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Nama Aplikasi", key: "nama_aplikasi", width: 30 },
    { header: "Unit", key: "unit", width: 15 },
    { header: "PIC", key: "pic", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Tanggal Ditambahkan", key: "tanggal", width: 20 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

  // Get data
  const data = await getFilteredData(filters);

  // Add rows
  data.forEach((row, index) => {
    worksheet.addRow({
      no: index + 1,
      nama_aplikasi: row.nama_aplikasi,
      unit: row.unit,
      pic: row.pic_internal,
      status: row.status_aplikasi,
      tanggal: row.created_at
        ? new Date(row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
    });
  });
}

// Helper: Map field names
function mapFieldName(kodeField) {
  const fieldMapping = {
    pdn_utama: "pdn_utama", // In getFilteredData it is pdn_utama
    pdn_backup: "pdn_backup",
    mandiri: "mandiri", // in getFilteredData it is mandiri
    ssl: "ssl",
    eselon_1: "nama_eselon1",
    eselon_2: "nama_eselon2",
    "nama_aplikasi": "nama_aplikasi",
    "deskripsi": "deskripsi",
    "platform": "platform",
    "jenis_aplikasi": "jenis_aplikasi",
    "status": "nama_status", // Status needs mapping if kode_field is status
    "framework": "kerangka_pengembangan",
    "frekuensi_update_data": "nama_frekuensi", 
    "api_internal_integrasi": "api_internal_status",
    "waf_lainnya": "waf",
    "environment_id": "jenis_environment"
  };
  
  // Specific check for status if kode_field is 'status' but data is 'nama_status'
  if (kodeField === 'status') return 'nama_status';
  if (kodeField === 'eselon_1') return 'nama_eselon1';
  if (kodeField === 'eselon_2') return 'nama_eselon2';
  
  return fieldMapping[kodeField] || kodeField;
}

// Helper: Create sheet for specific format with hierarchical headers
async function createFormatSheet(workbook, format, filters) {
  const worksheet = workbook.addWorksheet(format.nama_format.substring(0, 31)); // Excel sheet name limit

  // Get format details
  const formatDetails = await getFormatDetails(format.format_laporan_id);

  if (formatDetails.length === 0) {
    // No format details, skip this format
    console.log(`Skipping format ${format.nama_format} - no fields defined`);
    return;
  }

  // Build hierarchical structure from master_laporan_field tree
  const structure = await buildHierarchyFromMasterField(formatDetails);

  console.log(
    `[createFormatSheet] Built structure:`,
    structure.length
  );

  // Calculate column positions and create headers
  let currentCol = 1;
  const columnMapping = []; // Maps field_name to column index

  // Determine header rows needed
  let hasJudul = false;
  let hasSubJudul = false;

  structure.forEach((item) => {
    if (item.type === "group") {
      hasJudul = true;
      if (item.subGroups && item.subGroups.size > 0) {
        hasSubJudul = true;
      }
    }
  });

  const headerStartRow = hasJudul ? (hasSubJudul ? 3 : 2) : 1;

  // Add row number column first -- REMOVED per request
  // columnMapping.push({ fieldName: null, col: currentCol, isRowNumber: true });
  // worksheet.getCell(headerStartRow, currentCol).value = "No";
  // if (hasJudul && headerStartRow > 1) {
  //   worksheet.mergeCells(1, currentCol, headerStartRow, currentCol);
  //   worksheet.getCell(1, currentCol).value = "No";
  // }
  // currentCol++;

  // Build headers
  structure.forEach((item) => {
    if (item.type === "field") {
      // Standalone field
      const col = currentCol++;

      // Override Label if needed
      let label = item.label;
      if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
      if (label === 'WAF Lainnya') label = 'WAF';

      // Set header value at the appropriate row
      worksheet.getCell(headerStartRow, col).value = label;
      columnMapping.push({ fieldName: mapFieldName(item.fieldName), col });

      // Merge cells vertically if there are hierarchical headers above
      if (hasJudul && headerStartRow > 1) {
        // Merge from row 1 to headerStartRow for this column
        worksheet.mergeCells(1, col, headerStartRow, col);
        // Set the value in the merged cell (row 1)
        worksheet.getCell(1, col).value = label;
      }
    } else if (item.type === "group") {
      // Group with judul
      const startCol = currentCol;
      let groupColCount = 0;

      if (item.subGroups && item.subGroups.size > 0) {
        // Has sub-groups
        item.subGroups.forEach((fields, subJudul) => {
          const subStartCol = currentCol;
          fields.forEach((field) => {
            const col = currentCol++;
            
            let label = field.label;
            if (label === 'WAF Lainnya') label = 'WAF';
            if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';

            worksheet.getCell(headerStartRow, col).value = label;
            columnMapping.push({ fieldName: mapFieldName(field.fieldName), col });
            groupColCount++;
          });

          // Sub-judul header (row 2)
          if (hasSubJudul && currentCol > subStartCol) {
            worksheet.mergeCells(2, subStartCol, 2, currentCol - 1);
            worksheet.getCell(2, subStartCol).value = subJudul;
          }
        });
      } else {
        // No sub-groups, just fields
        if (item.fields) {
          item.fields.forEach((field) => {
            const col = currentCol++;

            let label = field.label;
            if (label === 'WAF Lainnya') label = 'WAF';
            if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';

            worksheet.getCell(headerStartRow, col).value = label;
            columnMapping.push({ fieldName: mapFieldName(field.fieldName), col });
            groupColCount++;
          });
        }
      }

      // Judul header (row 1)
      if (groupColCount > 0) {
        worksheet.mergeCells(1, startCol, 1, currentCol - 1);
        worksheet.getCell(1, startCol).value = item.judul;
      }
    }
  });

  // Style headers
  for (let row = 1; row <= headerStartRow; row++) {
    for (let col = 1; col < currentCol; col++) {
      const cell = worksheet.getCell(row, col);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" }, // Light Lavender/Gray to match Archive style
      };
      cell.font = { bold: true, size: 10 };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  }

  // Get data
  const data = await getFilteredData(filters);

  // Add data rows
  data.forEach((rowData, index) => {
    const rowNum = headerStartRow + index + 1;
    const row = worksheet.getRow(rowNum);
    
    columnMapping.forEach(({ fieldName, col, isRowNumber }) => {
      let value;
      if (isRowNumber) {
        value = index + 1;
      } else {
        value = rowData[fieldName] || "-";
        
        // Format specific field types
        if (fieldName && typeof value === 'string') {
          // Format SSL/HTTPS columns
          if ((value === '1' || value === 1) && (fieldName.includes('ssl') || fieldName.includes('https'))) {
            value = 'Ya';
          } else if ((value === '0' || value === 0) && (fieldName.includes('ssl') || fieldName.includes('https'))) {
            value = 'Tidak'; 
          }
        }
      }

      const cell = worksheet.getCell(rowNum, col);
      cell.value = value;
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const length = cell.value ? cell.value.toString().length : 10;
      if (length > maxLength) {
        maxLength = length;
      }
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });
}

/**
 * Get filtered data for exports
 */
async function getFilteredData(filters) {
  const { status, eselon1_id, eselon2_id, upt_id } = filters;

  const caraAksesMap = await getCaraAksesMap();

  let query = `
    SELECT 
      da.*,
      e1.nama_eselon1,
      e1.singkatan as unit_eselon1,
      e2.nama_eselon2,
      
      /* PIC Logic: Fetch from master tables via FK */
      pi.nama_pic_internal as pic_internal_master,
      pi.kontak_pic_internal as kontak_pic_internal_master,
      pe.nama_pic_eksternal as pic_eksternal_master,
      pe.kontak_pic_eksternal as kontak_pic_eksternal_master,

      /* PDN & Mandiri Aliases */
      pd1.kode_pdn as pdn_utama,
      da.pdn_backup as pdn_backup,
      da.mandiri_komputasi_backup as mandiri,
      da.mandiri_komputasi_backup as mandiri_backup,

      sa.nama_status,
      fp.nama_frekuensi,
      env.jenis_environment as jenis_environment
    FROM data_aplikasi da
    LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
    LEFT JOIN master_eselon2 e2 ON da.eselon2_id = e2.eselon2_id
    LEFT JOIN master_upt upt ON da.upt_id = upt.upt_id
    LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
    LEFT JOIN frekuensi_pemakaian fp ON da.frekuensi_pemakaian = fp.frekuensi_pemakaian
    LEFT JOIN environment env ON da.environment_id = env.environment_id
    LEFT JOIN pic_internal pi ON da.pic_internal_id = pi.pic_internal_id
    LEFT JOIN pic_eksternal pe ON da.pic_eksternal_id = pe.pic_eksternal_id
    LEFT JOIN pdn pd1 ON da.pdn_id = pd1.pdn_id
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "all") {
    query += ` AND da.status_aplikasi = ?`;
    params.push(status);
  }

  if (eselon1_id && eselon1_id !== "all") {
    query += ` AND da.eselon1_id = ?`;
    params.push(eselon1_id);
  }

  if (eselon2_id && eselon2_id !== "all") {
    query += ` AND da.eselon2_id = ?`;
    params.push(eselon2_id);
  }

  if (upt_id && upt_id !== "all") {
    query += ` AND da.upt_id = ?`;
    params.push(upt_id);
  }

  // Order by Eselon hierarchy (Setjen first), then by application name
  query += ` ORDER BY e1.eselon1_id ASC, e2.nama_eselon2 ASC, da.nama_aplikasi ASC`;

  const [rows] = await pool.query(query, params);

  // Post-process rows
  const formattedRows = rows.map((row) => {
    // Parse Cara Akses Multiple
    let caraAksesStr = "";
    if (row.cara_akses_multiple) {
      try {
        let ids = [];
        if (
          typeof row.cara_akses_multiple === "string" &&
          row.cara_akses_multiple.startsWith("[")
        ) {
          ids = JSON.parse(row.cara_akses_multiple);
        } else if (typeof row.cara_akses_multiple === "string") {
          ids = row.cara_akses_multiple.split(",").map((s) => s.trim());
        } else if (Array.isArray(row.cara_akses_multiple)) {
          ids = row.cara_akses_multiple;
        }

        caraAksesStr = ids.map((id) => caraAksesMap[id] || id).join(", ");
      } catch (e) {
        console.error("Error parsing cara_akses_multiple:", e);
        caraAksesStr = row.cara_akses_multiple;
      }
    }

    // Use Master PIC if available, fall back to direct field
    const picInternal = row.pic_internal_master || row.pic_internal;
    const picEksternal = row.pic_eksternal_master || row.pic_eksternal;
    const kontakPicInternal =
      row.kontak_pic_internal_master || row.kontak_pic_internal;
    const kontakPicEksternal =
      row.kontak_pic_eksternal_master || row.kontak_pic_eksternal;

    // WAF Logic: If "Lainnya", use "waf_lainnya" field
    let wafValue = row.waf;
    if (
      (row.waf && row.waf.toLowerCase() === "lainnya") ||
      (row.waf && row.waf.toLowerCase() === "waf - lainnya")
    ) {
      wafValue = row.waf_lainnya || row.waf;
    }

    return {
      ...row,
      cara_akses: caraAksesStr, // Standardize
      pic_internal: picInternal,
      pic_eksternal: picEksternal,
      kontak_pic_internal: kontakPicInternal,
      kontak_pic_eksternal: kontakPicEksternal,
      waf: wafValue,
    };
  });

  return formattedRows;
}

// Export to PDF
exports.exportPDF = async (req, res) => {
  try {
    const { format_laporan_id, tahun, status, eselon1_id, eselon2_id, upt_id } =
      req.query;

    // Get format details
    let formatName = "Laporan Aplikasi";
    let formatDetails = [];

    if (format_laporan_id) {
      const [formatRows] = await pool.query(
        `
        SELECT nama_format FROM format_laporan WHERE format_laporan_id = ?
      `,
        [format_laporan_id],
      );

      if (formatRows.length > 0) {
        formatName = formatRows[0].nama_format;
      }

      const [details] = await pool.query(
        `
        SELECT field_id, id as order_index
        FROM format_laporan_detail 
        WHERE format_laporan_id = ?
        ORDER BY id ASC
      `,
        [format_laporan_id],
      );

      formatDetails = details;
    }

    // Build hierarchical structure
    const structure = await buildHierarchyFromMasterField(formatDetails);

    // Get filtered data
    const filters = { tahun, status, eselon1_id, eselon2_id, upt_id };
    const data = await getFilteredData(filters);

    // Create PDF with landscape A3
    const doc = new PDFDocument({
      size: "A3",
      layout: "landscape",
      margin: 30,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${formatName}_${new Date().toISOString().split("T")[0]}.pdf"`,
    );

    doc.pipe(res);

    // Add title
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(formatName, { align: "center" });
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, {
        align: "center",
      });
    doc.moveDown(0.5);

    // Calculate layout
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;
    let startY = doc.y;

    // Count total columns
    let totalColumns = 0;
    const columnMapping = [];

    structure.forEach((item) => {
      if (item.type === "field") {
        totalColumns++;
        columnMapping.push({ fieldName: item.fieldName, label: item.label });
      } else if (item.type === "group") {
        if (item.subGroups.size > 0) {
          item.subGroups.forEach((fields) => {
            totalColumns += fields.length;
            fields.forEach((f) =>
              columnMapping.push({ fieldName: f.fieldName, label: f.label }),
            );
          });
        } else {
          totalColumns += item.fields.length;
          item.fields.forEach((f) =>
            columnMapping.push({ fieldName: f.fieldName, label: f.label }),
          );
        }
      }
    });

    let fontSize = 7;
    // Dynamic font size
    if (totalColumns > 15) fontSize = 6;
    if (totalColumns > 20) fontSize = 5;
    if (totalColumns > 25) fontSize = 4.5;
    
    // Increase basic row height to accommodate wrapping
    const rowHeight = 25; 
    const columnWidth = pageWidth / totalColumns;

    // Determine header rows
    let hasJudul = false;
    let hasSubJudul = false;

    structure.forEach((item) => {
      if (item.type === "group") {
        hasJudul = true;
        if (item.subGroups.size > 0) hasSubJudul = true;
      }
    });

    const headerRows = hasJudul ? (hasSubJudul ? 3 : 2) : 1;

    // Render headers
    doc.fontSize(fontSize).font("Helvetica-Bold");
    let currentCol = 0;

    // Helper function to draw cell
    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        fill = false,
        align = "center",
        fontSize: fs = fontSize,
      } = options;

      // Draw border
      doc.lineWidth(0.5);
      
      if (fill) {
        doc.rect(x, y, width, height).fillAndStroke("#e0e0e0", "#000000");
      } else {
        doc.rect(x, y, width, height).stroke();
      }

      // Draw text with wrapping and vertical centering
      doc.fontSize(fs).fillColor("#000000");
      
      const textOptions = {
        width: width - 4,
        align: align,
      };

      const textHeight = doc.heightOfString(text || "-", textOptions);
      // Calculate vertical center, but clamp to top padding if text is taller than cell
      const textY = textHeight < (height - 4) ? y + (height - textHeight) / 2 : y + 2;

      doc.text(text || "-", x + 2, textY, textOptions);
    };

    // Render Level 1 (Judul) if exists
    if (hasJudul) {
      let x = startX;
      structure.forEach((item) => {
        if (item.type === "field") {
          // Standalone field - merge all rows
          const height = rowHeight * headerRows;
          drawCell(x, startY, columnWidth, height, item.label, { fill: true });
          x += columnWidth;
        } else if (item.type === "group") {
          // Group - calculate span
          let colSpan = 0;
          if (item.subGroups.size > 0) {
            item.subGroups.forEach((fields) => (colSpan += fields.length));
          } else {
            colSpan = item.fields.length;
          }

          const width = columnWidth * colSpan;
          if (width > 0) {
             drawCell(x, startY, width, rowHeight, item.judul, { fill: true });
             x += width;
          }
        }
      });
    }

    // Render Level 2 (Sub-Judul or Fields for Groups without SubJudul)
    if (hasJudul && headerRows >= 2) {
      let x = startX;
      const y = startY + rowHeight;

      structure.forEach((item) => {
        if (item.type === "field") {
          // Already merged in Level 1
          x += columnWidth;
        } else if (item.type === "group") {
          if (item.subGroups.size > 0) {
            // Has Sub-groups: Draw Sub-group Headers
            item.subGroups.forEach((fields, subJudul) => {
              const width = columnWidth * fields.length;
              drawCell(x, y, width, rowHeight, subJudul, { fill: true });
              x += width;
            });
          } else {
            // No sub-groups: Draw Fields vertically spanning remaining rows
            // If headerRows=2: Height=1. If headerRows=3: Height=2.
            const height = rowHeight * (headerRows - 1);
            item.fields.forEach((f) => {
               drawCell(x, y, columnWidth, height, f.label, { fill: true });
               x += columnWidth;
            });
          }
        }
      });
    }

    // Render Level 3 (Fields for Groups with SubJudul only)
    if (hasSubJudul && headerRows === 3) {
      const fieldY = startY + rowHeight * 2;
      let x = startX;

      structure.forEach((item) => {
        if (item.type === "field") {
           x += columnWidth; // Skip
        } else if (item.type === "group") {
           if (item.subGroups.size > 0) {
              item.subGroups.forEach((fields) => {
                 fields.forEach((f) => {
                    drawCell(x, fieldY, columnWidth, rowHeight, f.label, { fill: true });
                    x += columnWidth;
                 });
              });
           } else {
              // Group w/o sub-groups (drawn in L2)
              x += columnWidth * item.fields.length;
           }
        }
      });
    } else if (!hasJudul) {
       // HeaderRows = 1 case. Draw all fields.
       let x = startX;
       columnMapping.forEach((col) => {
          drawCell(x, startY, columnWidth, rowHeight, col.label, { fill: true });
          x += columnWidth;
       });
    }

    // Move startY to the beginning of data rows
    startY += rowHeight * headerRows;
    doc.font("Helvetica");

    data.forEach((row, index) => {
      // 1. Calculate dynamic height for this row based on content
      let maxRowHeight = rowHeight;
      const processedValues = [];

      columnMapping.forEach((col) => {
        const value = col.fieldName ? row[col.fieldName] || "-" : "-";
        const strValue = String(value);
        processedValues.push(strValue);

        const textHeight = doc.heightOfString(strValue, { width: columnWidth - 4, align: 'center' });
        if (textHeight + 10 > maxRowHeight) {
            maxRowHeight = textHeight + 10;
        }
      });

      // Check if need new page
      if (startY + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        startY = doc.page.margins.top;

        // Re-render headers on new page
        // (simplified - just render field labels)
        x = startX;
        doc.font("Helvetica-Bold");
        columnMapping.forEach((col) => {
          drawCell(x, startY, columnWidth, rowHeight, col.label, {
            fill: true,
          });
          x += columnWidth;
        });
        startY += rowHeight;
        doc.font("Helvetica");
      }

      // Render data cells
      x = startX;
      columnMapping.forEach((col, idx) => {
        drawCell(x, startY, columnWidth, maxRowHeight, processedValues[idx], {
          align: "center",
        });
        x += columnWidth;
      });

      startY += maxRowHeight;
    });

    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({
      success: false,
      message: "Error export PDF",
      error: error.message,
    });
  }
};

// Export All Formats as PDF (Single Document with Sections)
exports.exportPDFAll = async (req, res) => {
  try {
    const { tahun, status, eselon1_id, eselon2_id, upt_id } = req.query;
    const filters = { tahun, status, eselon1_id, eselon2_id, upt_id };

    // Fetch all active formats
    const [formats] = await pool.query(`
      SELECT format_laporan_id, nama_format 
      FROM format_laporan 
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);

    if (formats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada format laporan aktif",
      });
    }

    // Get filtered data once (same for all formats)
    const data = await getFilteredData(filters);

    // Create PDF with landscape A3
    const doc = new PDFDocument({
      size: "A3",
      layout: "landscape",
      margin: 30,
    });

    // Build filename
    let filenameParts = ["Semua_Format_Laporan"];
    if (tahun && tahun !== "all") filenameParts.push(tahun);
    if (status && status !== "all") filenameParts.push("Status" + status);

    const filename = `${filenameParts.join("_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Add cover page
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("LAPORAN APLIKASI", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(14)
      .font("Helvetica")
      .text("Semua Format Laporan", { align: "center" });
    doc
      .fontSize(10)
      .text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, {
        align: "center",
      });
    doc
      .fontSize(10)
      .text(`Total Aplikasi: ${data.length}`, { align: "center" });
    doc.moveDown(2);

    // Add filter info if applied
    if (tahun && tahun !== "all") {
      doc.fontSize(9).text(`Filter Tahun: ${tahun}`, { align: "center" });
    }
    if (status && status !== "all") {
      doc.fontSize(9).text(`Filter Status: ${status}`, { align: "center" });
    }

    // Render each format
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];

      // Get format details
      const [formatDetails] = await pool.query(
        `
        SELECT field_id, id as order_index
        FROM format_laporan_detail 
        WHERE format_laporan_id = ?
        ORDER BY id ASC
      `,
        [format.format_laporan_id],
      );

      if (formatDetails.length === 0) {
        console.log(
          `Skipping format ${format.nama_format} - no fields defined`,
        );
        continue;
      }

      // Add new page for this format (except first)
      if (i > 0 || doc.y > 100) {
        doc.addPage();
      }

      // Add format title
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(format.nama_format, { align: "center" });
      doc.moveDown(0.5);

      // Build hierarchical structure
      const structure = await buildHierarchyFromMasterField(formatDetails);

      // Render PDF table for this format
      await renderPDFTableSection(doc, structure, data);
    }

    doc.end();
  } catch (error) {
    console.error("PDF Export All Error:", error);
    res.status(500).json({
      success: false,
      message: "Error export PDF semua format",
      error: error.message,
    });
  }
};

// Helper: Render PDF table section (extracted from exportPDF)
async function renderPDFTableSection(doc, structure, data) {
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startX = doc.page.margins.left;
  let startY = doc.y;

  // Count total columns and build mapping
  let totalColumns = 0;
  const columnMapping = [];

  structure.forEach((item) => {
    if (item.type === "field") {
      totalColumns++;
      columnMapping.push({ fieldName: item.fieldName, label: item.label });
    } else if (item.type === "group") {
      if (item.subGroups.size > 0) {
        item.subGroups.forEach((fields) => {
          totalColumns += fields.length;
          fields.forEach((f) =>
            columnMapping.push({ fieldName: f.fieldName, label: f.label }),
          );
        });
      } else {
        totalColumns += item.fields.length;
        item.fields.forEach((f) =>
          columnMapping.push({ fieldName: f.fieldName, label: f.label }),
        );
      }
    }
  });

  const columnWidth = pageWidth / totalColumns;
  const rowHeight = 18;
  const fontSize = 7;

  // Determine header rows
  let hasJudul = false;
  let hasSubJudul = false;

  structure.forEach((item) => {
    if (item.type === "group") {
      hasJudul = true;
      if (item.subGroups.size > 0) hasSubJudul = true;
    }
  });

  const headerRows = hasJudul ? (hasSubJudul ? 3 : 2) : 1;

  // Helper function to draw cell
  const drawCell = (x, y, width, height, text, options = {}) => {
    const { fill = false, align = "center", fontSize: fs = fontSize } = options;

    doc.rect(x, y, width, height).stroke();

    if (fill) {
      doc.rect(x, y, width, height).fillAndStroke("#e0e0e0", "#000000");
    }

    doc.fontSize(fs).fillColor("#000000");
    const textY = y + (height - fs) / 2;
    doc.text(text || "-", x + 2, textY, {
      width: width - 4,
      height: height,
      align: align,
      ellipsis: true,
    });
  };

  // Render headers (same logic as exportPDF)
  doc.fontSize(fontSize).font("Helvetica-Bold");

  if (hasJudul) {
    let x = startX;
    structure.forEach((item) => {
      if (item.type === "field") {
        const height = rowHeight * headerRows;
        drawCell(x, startY, columnWidth, height, item.label, { fill: true });
        x += columnWidth;
      } else if (item.type === "group") {
        let colSpan = 0;
        if (item.subGroups.size > 0) {
          item.subGroups.forEach((fields) => (colSpan += fields.length));
        } else {
          colSpan = item.fields.length;
        }

        const width = columnWidth * colSpan;
        drawCell(x, startY, width, rowHeight, item.judul, { fill: true });
        x += width;
      }
    });
  }

  if (hasSubJudul) {
    let x = startX;
    const y = startY + rowHeight;

    structure.forEach((item) => {
      if (item.type === "field") {
        x += columnWidth;
      } else if (item.type === "group") {
        if (item.subGroups.size > 0) {
          item.subGroups.forEach((fields, subJudul) => {
            const width = columnWidth * fields.length;
            drawCell(x, y, width, rowHeight, subJudul, { fill: true });
            x += width;
          });
        } else {
          const width = columnWidth * item.fields.length;
          x += width;
        }
      }
    });
  }

  const fieldY = startY + rowHeight * (headerRows - 1);
  let x = startX;

  columnMapping.forEach((col) => {
    drawCell(x, fieldY, columnWidth, rowHeight, col.label, { fill: true });
    x += columnWidth;
  });

  // Render data rows
  startY = fieldY + rowHeight;
  doc.font("Helvetica");

  data.forEach((row, index) => {
    if (startY + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      startY = doc.page.margins.top;

      // Re-render headers on new page
      x = startX;
      doc.font("Helvetica-Bold");
      columnMapping.forEach((col) => {
        drawCell(x, startY, columnWidth, rowHeight, col.label, { fill: true });
        x += columnWidth;
      });
      startY += rowHeight;
      doc.font("Helvetica");
    }

    x = startX;
    columnMapping.forEach((col) => {
      const value = col.fieldName ? row[col.fieldName] || "-" : "-";
      drawCell(x, startY, columnWidth, rowHeight, String(value), {
        align: "left",
      });
      x += columnWidth;
    });

    startY += rowHeight;
  });
}

// Export helper functions for reuse in other controllers
module.exports.mapFieldName = mapFieldName;
module.exports.parseHierarchicalLabel = parseHierarchicalLabel;
module.exports.buildHierarchyFromMasterField = buildHierarchyFromMasterField;
module.exports.getFormatDetails = getFormatDetails;
