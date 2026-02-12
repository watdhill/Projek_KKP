const pool = require("../config/database");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs").promises;
const path = require("path");

// Simple map function for field names
function mapFieldName(kodeField) {
  const fieldMapping = {
    // Basic mapping
    pdn_utama: "pdn_id",
    pdn_backup: "pdn_backup",
    mandiri: "mandiri_komputasi_backup",
    mandiri_backup: "mandiri_komputasi_backup",
    ssl: "ssl",
    eselon_1: "nama_eselon1",
    eselon_2: "nama_eselon2",
    environment_id: "jenis_environment",
    frekuensi_update_data: "nama_frekuensi",
    waf_lainnya: "waf",
    
    // Additional mapping for consistency with LaporanController
    framework: "kerangka_pengembangan",
    api_internal_integrasi: "api_internal_status",
    cara_akses: "cara_akses", // Will need special handling
    nama_aplikasi: "nama_aplikasi",
    deskripsi: "deskripsi",
    platform: "platform",
    jenis_aplikasi: "jenis_aplikasi",
    status: "nama_status", // if using status_aplikasi join
    
    // Explicit Aliases used in query
    pic_internal: "pic_internal",
    pic_eksternal: "pic_eksternal"
  };
  return fieldMapping[kodeField] || kodeField;
}

// Get Cara Akses Map (ID -> Name)
async function getCaraAksesMap() {
  try {
    const [rows] = await pool.query(
      "SELECT cara_akses_id, nama_cara_akses FROM cara_akses",
    );
    const map = {};
    rows.forEach((r) => {
      map[r.cara_akses_id] = r.nama_cara_akses;
    });
    return map;
  } catch (e) {
    console.error("Error fetching cara akses map:", e);
    return {};
  }
}

// Storage directory for snapshots
const STORAGE_DIR = path.join(__dirname, "../../storage/laporan-snapshots");

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * List all snapshots with pagination and filtering
 */
exports.listSnapshots = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      year,
      file_type,
      is_official,
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let params = [];

    if (year) {
      whereConditions.push("ls.snapshot_year = ?");
      params.push(year);
    }

    if (file_type) {
      whereConditions.push("ls.file_type = ?");
      params.push(file_type);
    }

    if (is_official !== undefined) {
      whereConditions.push("ls.is_official = ?");
      params.push(is_official === "true" || is_official === "1");
    }

    if (search) {
      whereConditions.push(
        "(ls.snapshot_name LIKE ? OR ls.description LIKE ?)"
      );
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM laporan_snapshots ls ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get snapshots with user and archive info
    const [snapshots] = await pool.query(
      `
      SELECT 
        ls.*,
        u.nama as generated_by_username
      FROM laporan_snapshots ls
      LEFT JOIN users u ON ls.generated_by = u.user_id
      ${whereClause}
      ORDER BY ls.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
      params
    );

    res.status(200).json({
      success: true,
      data: snapshots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List snapshots error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving snapshots",
      error: error.message,
    });
  }
};

/**
 * Generate new snapshot
 */
exports.generateSnapshot = async (req, res) => {
  try {
    const {
      snapshot_name,
      snapshot_year,
      file_type,
      selectedFormat,
      filters,
      description,
      is_official = false,
    } = req.body;

    const user_id = req.user?.user_id || 1;

    if (!snapshot_name || !snapshot_year || !file_type) {
      return res.status(400).json({
        success: false,
        message: "snapshot_name, snapshot_year, dan file_type wajib diisi",
      });
    }

    if (!["excel", "pdf"].includes(file_type)) {
      return res.status(400).json({
        success: false,
        message: "file_type harus 'excel' atau 'pdf'",
      });
    }

    // Ensure storage directory exists
    await ensureStorageDir();

    // Generate filename
    const timestamp = Date.now();
    const sanitizedName = snapshot_name
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const extension = file_type === "excel" ? "xlsx" : "pdf";
    const filename = `${sanitizedName}_${snapshot_year}_${timestamp}.${extension}`;
    const filePath = path.join(STORAGE_DIR, filename);
    const relativeFilePath = `laporan-snapshots/${filename}`;

    let fileSize = 0;
    let totalRecords = 0;

    // Generate file based on type
    if (file_type === "excel") {
      const result = await generateExcelSnapshot(
        filePath,
        snapshot_year,
        selectedFormat,
        filters || {}
      );
      fileSize = result.fileSize;
      totalRecords = result.totalRecords;
    } else {
      // PDF generation (Hierarchical)
      const result = await generatePDFSnapshot(filePath, snapshot_year, selectedFormat, filters || {});
      fileSize = result.fileSize;
      totalRecords = result.totalRecords;
    }

    // Save to database
    const [insertResult] = await pool.query(
      `
      INSERT INTO laporan_snapshots 
      (snapshot_name, snapshot_year, file_type, file_path, file_size, 
       filters, total_records, generated_by, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        snapshot_name,
        snapshot_year,
        file_type,
        relativeFilePath,
        fileSize,
        JSON.stringify(filters || {}),
        totalRecords,
        user_id,
        description || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Snapshot berhasil dibuat",
      data: {
        id: insertResult.insertId,
        snapshot_name,
        file_type,
        file_size: fileSize,
        total_records: totalRecords,
      },
    });
  } catch (error) {
    console.error("Generate snapshot error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating snapshot",
      error: error.message,
    });
  }
};

/**
 * Generate Excel snapshot with hierarchical format (same as regular export)
 */
async function generateExcelSnapshot(filePath, year, format_id, filters) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KKP System - Archive";
  
  // Get Cara Akses Map for data processing
  const caraAksesMap = await getCaraAksesMap();
  
  // Get data
  const dataQuery = buildDataQuery(year, filters);
  const [data] = await pool.query(dataQuery.sql, dataQuery.params);

  // If specific format selected, use hierarchical structure like regular export
  if (format_id && format_id !== "all") {
    await createHierarchicalFormatSheet(workbook, format_id, year, data, caraAksesMap);
  } else {
    // Default sheet for all formats or no format
    await createDefaultSheet(workbook, data, year, caraAksesMap);
  }

  await workbook.xlsx.writeFile(filePath);
  const stats = await fs.stat(filePath);

  return {
    fileSize: stats.size,
    totalRecords: data.length,
  };
}

/**
 * Create hierarchical format sheet (same logic as regular export)
 */
async function createHierarchicalFormatSheet(workbook, formatId, year, data, caraAksesMap) {
  // Get format name  
  const [formatInfo] = await pool.query(`
    SELECT nama_format 
    FROM format_laporan_archive 
    WHERE format_laporan_id = ? AND tahun_archive = ?
    LIMIT 1
  `, [formatId, year]);
  
  const sheetName = formatInfo.length > 0 
    ? formatInfo[0].nama_format.substring(0, 31)
    : `Format_${formatId}`;
    
  const worksheet = workbook.addWorksheet(sheetName);

  // Get format details from archive with proper hierarchy 
  const formatDetails = await getArchivedFormatDetailsWithHierarchy(formatId, year);
  
  if (formatDetails.length === 0) {
    console.log(`No format details found for format ${formatId}, year ${year}`);
    // Fallback to default
    await createDefaultSheet(workbook, data, year);
    return;
  }

  // Build hierarchical structure (same logic as laporanController)
  const structure = await buildHierarchyFromMasterFieldArchive(formatDetails);

  console.log(`[Archive Export] Format ${formatId} hierarchical structure built:`, structure.length, 'items');

  // Calculate column positions and create headers
  let currentCol = 1;
  const columnMapping = [];

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

  // Add row number column first - REMOVED
  // columnMapping.push({ fieldName: null, col: currentCol, isRowNumber: true });
  // worksheet.getCell(headerStartRow, currentCol).value = "No";
  // if (hasJudul && headerStartRow > 1) {
  //   worksheet.mergeCells(1, currentCol, headerStartRow, currentCol);
  //   worksheet.getCell(1, currentCol).value = "No";
  // }
  // currentCol++;

  // Build headers with hierarchical structure
  structure.forEach((item) => {
    if (item.type === "field") {
      // Standalone field
      const col = currentCol++;
      
      let label = item.label;
      if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
      if (label === 'WAF Lainnya') label = 'WAF';

      worksheet.getCell(headerStartRow, col).value = label;
      columnMapping.push({ fieldName: mapFieldName(item.fieldName), col });

      // Merge cells vertically if there are hierarchical headers above
      if (hasJudul && headerStartRow > 1) {
        worksheet.mergeCells(1, col, headerStartRow, col);
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
            if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
            if (label === 'WAF Lainnya') label = 'WAF';

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
            if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
            if (label === 'WAF Lainnya') label = 'WAF';

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
        fgColor: { argb: "FFE6E6FA" },
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

  // Add data rows
  data.forEach((row, index) => {
    const rowNum = headerStartRow + 1 + index;
    
    columnMapping.forEach((col) => {
      let value = row[col.fieldName];
      
      // Handle WAF Logic
      if (col.fieldName === 'waf') {
        if (value && typeof value === 'string' && (value.toLowerCase() === 'lainnya' || value.toLowerCase() === 'waf - lainnya')) {
          value = row.waf_lainnya || value;
        }
      }
      
      // Handle Cara Akses (JSON IDs or Text)
      if (col.fieldName === 'cara_akses' || col.fieldName === 'cara_akses_multiple') {
        if (!value || value === '-') {
            // Check alt field 
            value = row.cara_akses || row.cara_akses_multiple;
        }

        if (value && typeof value === 'string' && value !== '-' && caraAksesMap) {
            // Try to parse JSON array if it looks like one, otherwise assume comma-separated string
            try {
              let ids = [];
              if (value.startsWith("[") && value.endsWith("]")) {
                ids = JSON.parse(value);
              } else if (value.includes(",")) {
                ids = value.split(",").map((s) => s.trim());
              } else if (!isNaN(parseInt(value))) {
                 ids = [JSON.parse(value)]  
              } else {
                 // Assume it is already text name if not numeric
                 // But wait, if IDs are strings "1", "2"?
                 // If value is single ID, check map.
                 if (caraAksesMap[value]) {
                     ids = [value];
                 } else {
                     // Assume names already
                     ids = []; 
                 }
              }

              if (ids.length > 0) {
                 value = ids.map((id) => caraAksesMap[id] || id).join(", ");
              }
            } catch (e) {
              // Ignore parse error, use original value
            }
        }
      }

      // Handle Null/Undefined
      if (value === null || value === undefined || value === "") {
        value = "-";
      }

      // Format specific field types
      if (col.fieldName && (col.fieldName.includes('ssl') || col.fieldName.includes('https'))) {
         // Handle both number and string '1'/'0'
         if (value == 1 || value === '1' || value === 'Ya') value = 'Ya';
         else if (value == 0 || value === '0' || value === 'Tidak') value = 'Tidak';
      }
      
      const cell = worksheet.getCell(rowNum, col.col);
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
 * Get archived format details with hierarchy information
 */
async function getArchivedFormatDetailsWithHierarchy(formatId, year) {
  const [details] = await pool.query(`
    SELECT 
      fda.field_name,
      fda.kode_field, 
      fda.order_index,
      mlf.field_id,
      mlf.nama_field as label_tampilan,
      mlf.parent_id,  
      mlf.level,
      mlf.urutan
    FROM format_laporan_detail_archive fda
    JOIN format_laporan_archive fa ON fa.archive_id = fda.archive_id
    LEFT JOIN master_laporan_field mlf ON mlf.kode_field COLLATE utf8mb4_general_ci = fda.kode_field COLLATE utf8mb4_general_ci
    WHERE fa.format_laporan_id = ? AND fa.tahun_archive = ?
    ORDER BY fda.order_index ASC
  `, [formatId, year]);

  return details;
}

/**
 * Build hierarchy from archived format details (adapted from laporanController)
 */
async function buildHierarchyFromMasterFieldArchive(formatDetails) {
  const structure = [];

  // Get all field_ids from formatDetails
  const fieldIds = formatDetails
    .filter((d) => d.field_id)
    .map((d) => d.field_id);

  if (fieldIds.length === 0) {
    console.log("No field_ids found in format details");
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

  // Build tree structure (same logic as laporanController)
  const fieldMap = new Map();
  allFields.forEach((field) => {
    fieldMap.set(field.field_id, {
      ...field,
      children: [],
      ownOrder: orderMap.has(field.field_id) ? orderMap.get(field.field_id) : 999999,
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
      const childOrders = node.children.map((child) => processAndSortNode(child));
      const minChildOrder = Math.min(...childOrders);
      if (minChildOrder < minOrder) minOrder = minChildOrder;
      node.children.sort((a, b) => a.effectiveOrder - b.effectiveOrder);
    }
    node.effectiveOrder = minOrder;
    return minOrder;
  }

  roots.forEach((root) => processAndSortNode(root));
  roots.sort((a, b) => a.effectiveOrder - b.effectiveOrder);

  // Convert tree to export structure (same logic as laporanController)
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
                fieldName: f.kode_field,
              }));

            if (subFields.length > 0) {
              group.subGroups.set(child.nama_field, subFields);
            }
          } else if (child.level === 3 && fieldIds.includes(child.field_id)) {
            // Direct Level 3 under Level 1
            group.fields.push({
              label: child.nama_field,
              fieldName: child.kode_field,
            });
          }
        });

        if (group.subGroups.size > 0 || group.fields.length > 0) {
          result.push(group);
        }
      } else if (node.level === 3 && nodeIsSelected && !node.parent_id) {
        // Standalone Level 3 field (no parent)
        result.push({
          type: "field",
          label: node.nama_field,
          fieldName: node.kode_field,
        });
      }
    });

    return result;
  }

  return convertToExportStructure(roots);
}

/**
 * Create default sheet with basic columns
 */
async function createDefaultSheet(workbook, data, year, caraAksesMap) {
  const worksheet = workbook.addWorksheet(`Laporan ${year}`);
  
  // Default columns
  const columns = [
    // { header: "No", key: "no", width: 5 }, // Removed "No" column
    { header: "Nama Aplikasi", key: "nama_aplikasi", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Domain", key: "domain_aplikasi", width: 30 },
  ];

  worksheet.columns = columns;

  // Add data
  data.forEach((row, index) => {
    worksheet.addRow({
      // no: index + 1, // Removed
      nama_aplikasi: row.nama_aplikasi || "-",
      status: row.status || "-",
      domain_aplikasi: row.domain_aplikasi || "-",
    });
  });
}

/**
 * Generate PDF Snapshot
 */
async function generatePDFSnapshot(filePath, year, format_id, filters) {
  // Get Cara Akses Map
  const caraAksesMap = await getCaraAksesMap();
  
  // Get data
  const dataQuery = buildDataQuery(year, filters);
  const [data] = await pool.query(dataQuery.sql, dataQuery.params);

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 30, 
        size: "A3", 
        layout: "landscape" 
      });
      const writeStream = require("fs").createWriteStream(filePath);
      doc.pipe(writeStream);

      // Add basic metadata
      let title = `Laporan Aplikasi ${year}`;
      let formatDetails = [];
      let structure = [];

      // If format specified, get structure
      if (format_id && format_id !== "all") {
        const [formatInfo] = await pool.query(`
            SELECT nama_format 
            FROM format_laporan_archive 
            WHERE format_laporan_id = ? AND tahun_archive = ?
            LIMIT 1
        `, [format_id, year]);

        if (formatInfo.length > 0) title = formatInfo[0].nama_format;

        const details = await getArchivedFormatDetailsWithHierarchy(format_id, year);
        formatDetails = details;
        structure = await buildHierarchyFromMasterFieldArchive(formatDetails);
      } else {
        // Fallback or All formats (simplified for now to default cols)
        // For All Formats, we probably should have blocked it or used default.
        // Let's use default structure
        title = `Laporan Aplikasi ${year} (Default)`;
        // Create a fake structure for default columns
        structure = [
           { 
             type: 'group', judul: 'Identitas Aplikasi', fields: [], subGroups: new Map(),
             fields: [
               { label: 'Nama Aplikasi', fieldName: 'nama_aplikasi' },
               { label: 'Unit', fieldName: 'nama_eselon1' },
               { label: 'Status', fieldName: 'nama_status' },
               { label: 'Ekosistem', fieldName: 'jenis_environment' }
             ]
           }
        ];
        // Note: buildHierarchy usually returns list of groups/fields
      }

      // Title
      doc.fontSize(14).font("Helvetica-Bold").text(title, { align: "center" });
      doc.fontSize(9).font("Helvetica").text(`Generated: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
      doc.moveDown(0.5);

      // Calculate Layout
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = doc.page.margins.left;
      let startY = doc.y;

      let totalColumns = 0;
      const columnMapping = [];

      structure.forEach((item) => {
        if (item.type === "field") {
          totalColumns++;
          let label = item.label;
          if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
          if (label === 'WAF Lainnya') label = 'WAF';
          columnMapping.push({ fieldName: mapFieldName(item.fieldName), label });
        } else if (item.type === "group") {
          if (item.subGroups && item.subGroups.size > 0) {
            item.subGroups.forEach((fields) => {
              totalColumns += fields.length;
              fields.forEach((f) => {
                let label = f.label;
                if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
                if (label === 'WAF Lainnya') label = 'WAF';
                columnMapping.push({ fieldName: mapFieldName(f.fieldName), label });
              });
            });
          } else {
            if (item.fields) {
                totalColumns += item.fields.length;
                item.fields.forEach((f) => {
                    let label = f.label;
                    if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
                    if (label === 'WAF Lainnya') label = 'WAF';
                    columnMapping.push({ fieldName: mapFieldName(f.fieldName), label });
                });
            }
          }
        }
      });

      if (totalColumns === 0) totalColumns = 1; 
      
      // Better column width calculation
      // If we have many columns, we might need a horizontal layout that scrolls (not possible in PDF easily)
      // or we just shrink the font VERY small or we assume A3 is enough.
      // A3 landscape is 1190 points wide. Minus 60 margins = 1130.
      // If 25 columns, 1130/25 = 45 points per column. (approx 1.5cm)
      // That's very tight. 
      // Let's implement dynamic font resizing based on column count.
      
      let columnWidth = pageWidth / totalColumns;
      const rowHeight = 25; // Increased row height for wrapping
      let fontSize = 7;
      
      if (totalColumns > 15) {
          fontSize = 6;
      }
      if (totalColumns > 20) {
          fontSize = 5;
      }
      if (totalColumns > 25) {
          fontSize = 4.5; // Very small but necessary
      }
      
      // Determine Header Rows
      let hasJudul = false;
      let hasSubJudul = false;

      structure.forEach((item) => {
        if (item.type === "group") {
          hasJudul = true;
          if (item.subGroups && item.subGroups.size > 0) hasSubJudul = true;
        }
      });

      const headerRows = hasJudul ? (hasSubJudul ? 3 : 2) : 1;
      
      doc.fontSize(fontSize).font("Helvetica-Bold");

      // Improved Draw Cell Helper with Wrapping and Vertical Centering
      const drawCell = (x, y, width, height, text, options = {}) => {
        const { fill = false, align = "center", fontSize: fs = fontSize, wrap = true } = options;
        
        doc.lineWidth(0.5);
        
        // Fill
        if (fill) {
            doc.rect(x, y, width, height).fillAndStroke("#f0f0f0", "#000000");
        } else {
            doc.rect(x, y, width, height).stroke();
        }

        // Text
        doc.fillColor("#000000").fontSize(fs);
        
        const textOptions = {
            width: width - 4,
            align: align,
        };
        
        const textHeight = doc.heightOfString(text || "-", textOptions);
        const textY = textHeight < (height - 4) ? y + (height - textHeight) / 2 : y + 2;
        
        doc.text(text || "-", x + 2, textY, textOptions);
      };

      // Warning: This header rendering logic mimics laporanController but needs to be careful with x/y
      // Render Level 1
       if (hasJudul) {
          let x = startX;
          structure.forEach((item) => {
            if (item.type === "field") {
              const height = rowHeight * headerRows;
              let label = item.label;
                if (label === 'Frekuensi Update Data') label = 'Frekuensi Pemakaian';
                if (label === 'WAF Lainnya') label = 'WAF';
              drawCell(x, startY, columnWidth, height, label, { fill: true });
              x += columnWidth;
            } else if (item.type === "group") {
              let colSpan = 0;
              if (item.subGroups && item.subGroups.size > 0) {
                item.subGroups.forEach((fields) => (colSpan += fields.length));
              } else {
                colSpan = item.fields ? item.fields.length : 0;
              }

              const width = columnWidth * colSpan;
              if (width > 0) { // Only draw if has columns
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
            if (item.subGroups && item.subGroups.size > 0) {
              // Has Sub-groups: Draw Sub-group Headers
              item.subGroups.forEach((fields, subJudul) => {
                const width = columnWidth * fields.length;
                drawCell(x, y, width, rowHeight, subJudul, { fill: true });
                x += width;
              });
            } else {
              // No sub-groups: Draw Fields vertically spanning remaining rows
              const height = rowHeight * (headerRows - 1);
              if (item.fields) {
                 item.fields.forEach((f) => {
                    drawCell(x, y, columnWidth, height, f.label, { fill: true });
                    x += columnWidth;
                 });
              }
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
             if (item.subGroups && item.subGroups.size > 0) {
                item.subGroups.forEach((fields) => {
                   fields.forEach((f) => {
                      drawCell(x, fieldY, columnWidth, rowHeight, f.label, { fill: true });
                      x += columnWidth;
                   });
                });
             } else {
                // Group w/o sub-groups (drawn in L2)
                if (item.fields) x += columnWidth * item.fields.length;
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


      // Render Data
      startY += rowHeight * headerRows;
      doc.font("Helvetica");

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        let processedValues = [];
        let maxRowHeight = rowHeight;
        
        // 1. Calculate dynamic height for this row based on content
        columnMapping.forEach((col) => {
             let value = row[col.fieldName];
             
             // Handle Processors (same as before)
             if (col.fieldName === 'cara_akses' || col.fieldName === 'cara_akses_multiple') {
                if (!value || value === '-') value = row.cara_akses || row.cara_akses_multiple;
                if (value && typeof value === 'string' && value !== '-' && caraAksesMap) {
                    try {
                        let ids = [];
                        if (value.startsWith("[") && value.endsWith("]")) ids = JSON.parse(value);
                        else if (value.includes(",")) ids = value.split(",").map(s => s.trim());
                        else if (!isNaN(parseInt(value))) ids = [JSON.parse(value)];
                        
                        if (ids.length > 0) value = ids.map(id => caraAksesMap[id] || id).join(", ");
                    } catch (e) {}
                }
             }
             if (col.fieldName === 'waf') {
                if (value && typeof value === 'string' && (value.toLowerCase() === 'lainnya' || value.toLowerCase() === 'waf - lainnya')) {
                    value = row.waf_lainnya || value;
                }
             }
             if (col.fieldName && (col.fieldName.includes('ssl') || col.fieldName.includes('https'))) {
                 if (value == 1 || value === '1' || value === 'Ya') value = 'Ya';
                 else if (value == 0 || value === '0' || value === 'Tidak') value = 'Tidak';
             }
             if (value === null || value === undefined || value === "") value = "-";
             
             const strValue = typeof value === 'string' ? value : String(value);
             processedValues.push(strValue);
             
             const textHeight = doc.heightOfString(strValue, { width: columnWidth - 4, align: 'center' });
             if (textHeight + 10 > maxRowHeight) { // +10 for buffer padding
                 maxRowHeight = textHeight + 10;
             }
        });

        // Page break check (using dynamic height)
        if (startY + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            startY = doc.page.margins.top;
            
            // Re-render headers (Simplified for new page: just field labels)
            let hx = startX;
            doc.font("Helvetica-Bold");
            columnMapping.forEach((col) => {
                drawCell(hx, startY, columnWidth, rowHeight, col.label, { fill: true });
                hx += columnWidth;
            });
            startY += rowHeight;
            doc.font("Helvetica");
        }

        let dx = startX;
        columnMapping.forEach((col, idx) => {
            const val = processedValues[idx];
            drawCell(dx, startY, columnWidth, maxRowHeight, val, { align: "center", wrap: true });
            dx += columnWidth;
        });

        startY += maxRowHeight;
      }

      doc.end();

      writeStream.on("finish", async () => {
          const stats = await fs.stat(filePath);
          resolve({ fileSize: stats.size, totalRecords: data.length });
      });
      
      writeStream.on("error", reject);

    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Generate simple PDF (Deprecated but kept for fallback)
 */
async function generateSimplePDF(filePath, year, filters) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      doc.pipe(require("fs").createWriteStream(filePath));

      // Get data
      const dataQuery = buildDataQuery(year, filters);
      const [data] = await pool.query(dataQuery.sql, dataQuery.params);

      // Simple PDF content
      doc.fontSize(16).text(`Laporan Aplikasi ${year}`, 50, 50);
      doc.fontSize(12).text(`Total Records: ${data.length}`, 50, 80);

      // Simple table
      let y = 120;
      data.slice(0, 30).forEach((row, index) => {
        doc.text(
          `${index + 1}. ${row.nama_aplikasi || "-"} - ${row.status || "-"}`,
          50,
          y
        );
        y += 20;
      });

      doc.end();

      doc.on("end", async () => {
        const stats = await fs.stat(filePath);
        resolve({
          fileSize: stats.size,
          totalRecords: data.length,
        });
      });

      doc.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Build data query
 */
function buildDataQuery(year, filters) {
  const { status, eselon1_id, eselon2_id, upt_id } = filters;

  const currentYear = new Date().getFullYear();
  const useArchive = year < currentYear;

  const tableName = useArchive ? "data_aplikasi_archive" : "data_aplikasi";
  const alias = "da";

  let whereClauses = [];
  let params = [];

  if (useArchive) {
    whereClauses.push(`${alias}.archive_year = ?`);
    params.push(year);
  }

  if (status && status !== "all") {
    whereClauses.push(`${alias}.${useArchive ? "status" : "status_aplikasi"} = ?`);
    params.push(status);
  }

  if (eselon1_id && eselon1_id !== "all") {
    whereClauses.push(`${alias}.eselon1_id = ?`);
    params.push(eselon1_id);
  }

  if (eselon2_id && eselon2_id !== "all") {
    whereClauses.push(`${alias}.eselon2_id = ?`);
    params.push(eselon2_id);
  }
  
  if (upt_id && upt_id !== "all") {
     whereClauses.push(`${alias}.upt_id = ?`);
     params.push(upt_id);
  }

  const whereClause =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let sql = "";
  if (useArchive) {
    // For Archive: Join if IDs exist and we need names.
    // Based on schema, environment_id, eselon1, eselon2, upt exists.
    // Status is varchar, so direct select.
    sql = `
      SELECT 
        ${alias}.*,
        e1.nama_eselon1,
        e2.nama_eselon2,
        upt.nama_upt,
        env.jenis_environment as jenis_environment,
        ${alias}.status as nama_status
      FROM ${tableName} ${alias}
      LEFT JOIN master_eselon1 e1 ON ${alias}.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON ${alias}.eselon2_id = e2.eselon2_id
      LEFT JOIN master_upt upt ON ${alias}.upt_id = upt.upt_id
      LEFT JOIN environment env ON ${alias}.environment_id = env.environment_id
      ${whereClause} 
      ORDER BY ${alias}.nama_aplikasi ASC
    `;
  } else {
    // For Live Data: Full Joins
    sql = `
      SELECT 
        ${alias}.*,
        e1.nama_eselon1,
        e2.nama_eselon2,
        upt.nama_upt,
        sa.nama_status,
        env.jenis_environment as jenis_environment,
        fp.nama_frekuensi,
        
        pi.nama_pic_internal as pic_internal_master,
        pe.nama_pic_eksternal as pic_eksternal_master,

        ${alias}.waf,
        ${alias}.ssl,
        ${alias}.mandiri_komputasi_backup,
        ${alias}.kerangka_pengembangan,
        ${alias}.api_internal_status
        
      FROM ${tableName} ${alias}
      LEFT JOIN master_eselon1 e1 ON ${alias}.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON ${alias}.eselon2_id = e2.eselon2_id
      LEFT JOIN master_upt upt ON ${alias}.upt_id = upt.upt_id
      LEFT JOIN status_aplikasi sa ON ${alias}.status_aplikasi = sa.status_aplikasi_id
      LEFT JOIN environment env ON ${alias}.environment_id = env.environment_id
      LEFT JOIN frekuensi_pemakaian fp ON ${alias}.frekuensi_pemakaian = fp.frekuensi_pemakaian
      LEFT JOIN pic_internal pi ON ${alias}.pic_internal_id = pi.pic_internal_id
      LEFT JOIN pic_eksternal pe ON ${alias}.pic_eksternal_id = pe.pic_eksternal_id
      ${whereClause} 
      ORDER BY ${alias}.nama_aplikasi ASC
    `;
  }

  return { sql, params };
}

/**
 * Get available years for snapshots
 */
exports.getAvailableYears = async (req, res) => {
  try {
    const [years] = await pool.query(`
      SELECT DISTINCT snapshot_year as year 
      FROM laporan_snapshots 
      ORDER BY snapshot_year DESC
    `);
    
    // Add current year if not present
    const yearList = years.map(r => r.year);
    const currentYear = new Date().getFullYear();
    
    if (!yearList.includes(currentYear)) {
      yearList.unshift(currentYear);
    }
    
    // If yearList is still empty (e.g. no current year added?), add current year
    if (yearList.length === 0) {
      yearList.push(currentYear);
    }
    
    // Sort descending
    yearList.sort((a, b) => b - a);

    res.json({
      success: true,
      data: yearList,
    });
  } catch (error) {
    console.error("Get available years error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving available years",
    });
  }
};

/**
 * Download snapshot file
 */
exports.downloadSnapshot = async (req, res) => {
  try {
    const { id } = req.params;

    const [snapshot] = await pool.query(
      "SELECT * FROM laporan_snapshots WHERE id = ?",
      [id]
    );

    if (snapshot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Snapshot tidak ditemukan",
      });
    }

    const snapshotData = snapshot[0];
    const filePath = path.join(__dirname, "../../storage", snapshotData.file_path);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File snapshot tidak ditemukan",
      });
    }

    const contentType =
      snapshotData.file_type === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";

    const fileName = `${snapshotData.snapshot_name}_${snapshotData.snapshot_year}.${
      snapshotData.file_type === "excel" ? "xlsx" : "pdf"
    }`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const readStream = require("fs").createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    console.error("Download snapshot error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading snapshot",
    });
  }
};

/**
 * Delete snapshot
 */
exports.deleteSnapshot = async (req, res) => {
  try {
    const { id } = req.params;

    const [snapshot] = await pool.query(
      "SELECT * FROM laporan_snapshots WHERE id = ?",
      [id]
    );

    if (snapshot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Snapshot tidak ditemukan",
      });
    }

    const filePath = path.join(__dirname, "../../storage", snapshot[0].file_path);

    // Delete from database
    await pool.query("DELETE FROM laporan_snapshots WHERE id = ?", [id]);

    // Delete file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log("File already deleted or not found:", error.message);
    }

    res.json({
      success: true,
      message: "Snapshot berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete snapshot error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting snapshot",
    });
  }
};