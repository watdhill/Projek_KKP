const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

// Table configuration to map type to database table, columns, and ID field
const tableConfig = {
  eselon1: {
    tableName: "master_eselon1",
    idField: "eselon1_id",
    columns: [
      "no",
      "nama_eselon1",
      "singkatan",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["No", "Nama Eselon 1", "Singkatan", "Status"],
  },
  eselon2: {
    tableName: "master_eselon2",
    idField: "eselon2_id",
    columns: [
      "eselon1_id",
      "nama_eselon2",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Eselon 1", "Nama Eselon 2", "Status"],
  },
  upt: {
    tableName: "master_upt",
    idField: "upt_id",
    columns: [
      "eselon1_id",
      "nama_upt",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Eselon 1", "Nama UPT", "Status"],
  },
  frekuensi_pemakaian: {
    tableName: "frekuensi_pemakaian",
    idField: "frekuensi_pemakaian",
    columns: [
      "nama_frekuensi",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Nama Frekuensi", "Status"],
  },
  status_aplikasi: {
    tableName: "status_aplikasi",
    idField: "status_aplikasi_id",
    columns: [
      "nama_status",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Nama Status", "Status"],
  },
  environment: {
    tableName: "environment",
    idField: "environment_id",
    columns: [
      "jenis_environment",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Jenis Ekosistem", "Status"],
  },
  cara_akses: {
    tableName: "cara_akses",
    idField: "cara_akses_id",
    columns: [
      "nama_cara_akses",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Nama Cara Akses", "Status"],
  },
  pdn: {
    tableName: "PDN",
    idField: "pdn_id",
    columns: [
      "kode_pdn",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Kode PDN", "Status"],
  },
  format_laporan: {
    tableName: "format_laporan",
    idField: "format_laporan_id",
    columns: [
      "nama_format",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Nama Format", "Status"],
  },
  pic_eksternal: {
    tableName: "pic_eksternal",
    idField: "pic_eksternal_id",
    columns: [
      "eselon2_id",
      "nama_pic_eksternal",
      "email_pic",
      "kontak_pic_eksternal",
      "keterangan",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: [
      "Eselon 2",
      "Nama PIC",
      "Email",
      "No. HP",
      "Keterangan",
      "Status",
    ],
  },
  pic_internal: {
    tableName: "pic_internal",
    idField: "pic_internal_id",
    columns: [
      "eselon2_id",
      "nama_pic_internal",
      "email_pic",
      "kontak_pic_internal",
      "status_aktif",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
    ],
    displayColumns: ["Eselon 2", "Nama PIC", "Email", "No. HP", "Status"],
  },
};

// ... (existing code)

// Get table config by type (support static + dynamic tables)
const getConfig = (type) => {
  // Check static config first
  if (tableConfig[type]) {
    return tableConfig[type];
  }

  // Check dynamic config
  const dynamicConfigPath = path.join(
    __dirname,
    "../config/dynamicTableConfig.json",
  );
  try {
    if (fs.existsSync(dynamicConfigPath)) {
      // Clear cache untuk hot reload
      delete require.cache[require.resolve(dynamicConfigPath)];
      const dynamicConfig = require(dynamicConfigPath);

      if (dynamicConfig[type]) {
        return dynamicConfig[type];
      }
    }
  } catch (err) {
    console.error("Error loading dynamic config:", err);
  }

  throw new Error(
    `Tipe master data "${type}" tidak valid. Tipe yang tersedia: ${Object.keys(tableConfig).join(", ")}`,
  );
};

// Get all master data by type
exports.getAllMasterData = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);

    let query = `SELECT * FROM ${config.tableName}`;
    const params = [];

    // Filter by eselon1_id or eselon2_id for PIC types (Hierarchical Visibility)
    // Also support created_by for strict ownership visibility
    if (type === "pic_internal" || type === "pic_eksternal") {
      // Base query with JOINs to get unit names for display
      query = `SELECT t.*, e1.nama_eselon1, e1.eselon1_id, e2.nama_eselon2, u.nama_upt
               FROM ${config.tableName} t
               LEFT JOIN master_eselon2 e2 ON t.eselon2_id = e2.eselon2_id
               LEFT JOIN master_upt u ON t.upt_id = u.upt_id
               LEFT JOIN master_eselon1 e1 ON e1.eselon1_id = COALESCE(e2.eselon1_id, u.eselon1_id)
               WHERE 1=1`;

      if (req.query.created_by) {
        // Strict ownership: only show records created by this user
        query += ` AND t.created_by = ?`;
        params.push(req.query.created_by);
      } else if (req.query.eselon1_id) {
        // Filter by Eselon 1: show PICs under this Eselon 1 (via Eselon 2 or UPT)
        query += ` AND (e2.eselon1_id = ? OR u.eselon1_id = ?)`;
        params.push(req.query.eselon1_id, req.query.eselon1_id);
      } else if (req.query.eselon2_id) {
        // Filter by Eselon 2: Direct filter on eselon2_id
        query += ` AND t.eselon2_id = ?`;
        params.push(req.query.eselon2_id);
      }
    } else if ((type === "eselon2" || type === "upt") && req.query.eselon1_id) {
      // Filter Eselon 2 or UPT by Eselon 1
      query = `SELECT * FROM ${config.tableName} WHERE eselon1_id = ?`;
      params.push(req.query.eselon1_id);
    }

    let orderClause = ` ORDER BY ${config.idField} DESC`;
    if (type === "eselon1") {
      orderClause = ` ORDER BY no ASC`;
    } else if (type === "status_aplikasi") {
      orderClause = ` ORDER BY nama_status ASC`;
    } else if (type === "environment") {
      orderClause = ` ORDER BY jenis_environment ASC`;
    }
    query += orderClause;

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      type: type,
      columns: config.displayColumns,
      idField: config.idField,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil master data",
      error: error.message,
    });
  }
};

// Get master data by ID
exports.getMasterDataById = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);

    const [rows] = await pool.query(
      `SELECT * FROM ${config.tableName} WHERE ${config.idField} = ?`,
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Master data tidak ditemukan",
      });
    }

    const data = rows[0];

    // If type is format_laporan, fetch detail field IDs
    if (type === "format_laporan") {
      const [details] = await pool.query(
        "SELECT field_id, order_index FROM format_laporan_detail WHERE format_laporan_id = ?",
        [req.params.id],
      );
      data.field_ids = details.map((d) => d.field_id);
      data.field_details = details;
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil master data",
      error: error.message,
    });
  }
};

// Create master data
exports.createMasterData = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);

    console.log("=== CREATE MASTER DATA ===");
    console.log("Type:", type);
    console.log("Body:", req.body);

    // Validate eselon1_id exists for eselon2 or upt type
    if ((type === "eselon2" || type === "upt") && req.body.eselon1_id) {
      const [eselon1Check] = await pool.query(
        "SELECT eselon1_id FROM master_eselon1 WHERE eselon1_id = ?",
        [req.body.eselon1_id],
      );
      if (eselon1Check.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Eselon 1 dengan ID ${req.body.eselon1_id} tidak ditemukan di database`,
        });
      }
    }

    // Check for duplicate names based on type
    const nameField = {
      eselon1: "nama_eselon1",
      eselon2: "nama_eselon2",
      upt: "nama_upt",
      frekuensi_pemakaian: "nama_frekuensi",
      status_aplikasi: "nama_status",
      environment: "jenis_environment",
      cara_akses: "nama_cara_akses",
      pdn: "kode_pdn",
      format_laporan: "nama_format",
      pic_eksternal: "nama_pic_eksternal",
      pic_internal: "nama_pic_internal",
    };

    // Validate eselon2_id exists for pic types
    if (type === "pic_internal" && req.body.eselon2_id) {
      const [eselon2Check] = await pool.query(
        "SELECT eselon2_id FROM master_eselon2 WHERE eselon2_id = ?",
        [req.body.eselon2_id],
      );
      if (eselon2Check.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Eselon 2 dengan ID ${req.body.eselon2_id} tidak ditemukan di database`,
        });
      }
    }

    if (nameField[type] && req.body[nameField[type]]) {
      const [duplicateCheck] = await pool.query(
        `SELECT ${config.idField} FROM ${config.tableName} WHERE ${nameField[type]} = ?`,
        [req.body[nameField[type]]],
      );
      if (duplicateCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Data dengan nama "${req.body[nameField[type]]}" sudah ada. Tidak boleh duplikat.`,
        });
      }
    }

    // Check for duplicate 'no' in eselon1 or 'no_urutan' in eselon2
    if (type === "eselon1" && req.body.no !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT eselon1_id FROM master_eselon1 WHERE no = ?",
        [req.body.no],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }
    if (type === "eselon2" && req.body.no_urutan !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT eselon2_id FROM master_eselon2 WHERE no_urutan = ?",
        [req.body.no_urutan],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no_urutan}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }
    if (type === "upt" && req.body.no_urutan !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT upt_id FROM master_upt WHERE no_urutan = ?",
        [req.body.no_urutan],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no_urutan}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }

    // Build dynamic insert query based on provided fields
    const fields = [];
    const values = [];
    const placeholders = [];

    // For dynamic tables, get actual column names from database
    const isDynamicTable = !tableConfig[type];
    let columnsToInsert = config.columns;

    if (isDynamicTable) {
      // Query table structure to get allowed columns
      const [tableColumns] = await pool.query(
        `SHOW COLUMNS FROM ${config.tableName}`,
      );

      // Exclude auto-increment ID and timestamp columns
      const allowedColumns = tableColumns
        .map((col) => col.Field)
        .filter((field) => {
          const fieldLower = field.toLowerCase();
          return (
            field !== config.idField && // exclude ID fields
            fieldLower !== "created_at" &&
            fieldLower !== "updated_at" &&
            req.body[field] !== undefined
          ); // only fields present in request
        });

      columnsToInsert = allowedColumns;
    }

    for (const col of columnsToInsert) {
      if (req.body[col] !== undefined) {
        fields.push(col);
        let val = req.body[col];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
        placeholders.push("?");
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada field yang diberikan untuk insert",
      });
    }

    const sql = `INSERT INTO ${config.tableName} (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`;
    console.log("SQL:", sql);
    console.log("Values:", values);

    const [result] = await pool.query(sql, values);
    const newId = result.insertId;

    // Handle format_laporan_detail if type is format_laporan
    if (type === "format_laporan" && req.body.field_ids) {
      let fieldIds = req.body.field_ids;
      if (typeof fieldIds === "string") {
        try {
          fieldIds = JSON.parse(fieldIds);
        } catch (e) {
          fieldIds = fieldIds.split(",").map((id) => id.trim());
        }
      }

      if (Array.isArray(fieldIds) && fieldIds.length > 0) {
        // Deduplicate fieldIds to prevent SQL Error (ER_DUP_ENTRY)
        fieldIds = [...new Set(fieldIds)];

        // VALIDATON: Only allow IDs that exist in master_laporan_field
        const [validFields] = await pool.query(
          "SELECT field_id FROM master_laporan_field WHERE field_id IN (?)",
          [fieldIds]
        );
        const validSet = new Set(validFields.map(f => f.field_id));
        fieldIds = fieldIds.filter(id => validSet.has(id));

        if (fieldIds.length > 0) {
          // Get parent_id for each field to determine grouping
          const [fieldInfo] = await pool.query(`
              SELECT field_id, parent_id
              FROM master_laporan_field
              WHERE field_id IN (?)
            `, [fieldIds]);

          const fieldMap = {};
          fieldInfo.forEach(f => {
            fieldMap[f.field_id] = f.parent_id;
          });

          // Get click order for individual fields (optional parameter)
          let clickOrder = {};
          if (req.body.field_click_order) {
            clickOrder = typeof req.body.field_click_order === 'string'
              ? JSON.parse(req.body.field_click_order)
              : req.body.field_click_order;
          }

          // Separate fields into groups
          const groupedFields = {}; // {parent_id: [field_ids]}
          const individualFields = []; // fields without parent

          fieldIds.forEach(fid => {
            const parentId = fieldMap[fid];
            if (parentId) {
              if (!groupedFields[parentId]) {
                groupedFields[parentId] = [];
              }
              groupedFields[parentId].push(fid);
            } else {
              individualFields.push(fid);
            }
          });

          // Sort individual fields by click order if available
          if (Object.keys(clickOrder).length > 0) {
            individualFields.sort((a, b) => {
              const orderA = clickOrder[a] || 999999;
              const orderB = clickOrder[b] || 999999;
              return orderA - orderB;
            });
          }

          // Build final ordered array
          // Groups should appear at the position of their FIRST clicked field
          const orderedFieldIds = [];
          const processedParents = new Set();

          // Create a combined list with click orders
          const allItems = [];

          // Add individual fields
          individualFields.forEach(fid => {
            allItems.push({
              type: 'individual',
              field_id: fid,
              click_order: clickOrder[fid] || 999999
            });
          });

          // Add groups (use click order of first field in group)
          Object.keys(groupedFields).forEach(parentId => {
            const groupFieldIds = groupedFields[parentId];
            // Find minimum click order in this group (first clicked field)
            let minClickOrder = 999999;
            groupFieldIds.forEach(fid => {
              if (clickOrder[fid] && clickOrder[fid] < minClickOrder) {
                minClickOrder = clickOrder[fid];
              }
            });

            allItems.push({
              type: 'group',
              parent_id: parentId,
              field_ids: groupFieldIds,
              click_order: minClickOrder
            });
          });

          // Sort all items by click order
          allItems.sort((a, b) => a.click_order - b.click_order);

          // Build final array
          allItems.forEach(item => {
            if (item.type === 'individual') {
              orderedFieldIds.push(item.field_id);
            } else if (item.type === 'group') {
              // Add all fields in this group (maintain tree order within group)
              orderedFieldIds.push(...item.field_ids);
            }
          });

          console.log('Original order:', fieldIds);
          console.log('Click order:', clickOrder);
          console.log('Final order:', orderedFieldIds);

          // Insert with order_index
          const detailValues = orderedFieldIds.map((fid, index) => [
            newId, // format_laporan_id
            null, // parent_id
            null, // judul
            0, // is_header
            fid, // field_id
            index + 1, // order_index
          ]);

          await pool.query(
            "INSERT INTO format_laporan_detail (format_laporan_id, parent_id, judul, is_header, field_id, order_index) VALUES ?",
            [detailValues]
          );
        } // End if fieldIds.length > 0 check block (added else handling above)
      }
    }


    res.status(201).json({
      success: true,
      message: "Master data berhasil ditambahkan",
      data: { id: newId, ...req.body },
    });
  } catch (error) {
    console.error("=== ERROR CREATE MASTER DATA ===");
    console.error("Error:", error);

    // Provide more detailed error message
    let errorMessage = "Error memperbarui master data";
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      errorMessage =
        "Data yang dipilih tidak valid atau tidak ditemukan di tabel referensi (Foreign Key Error)";
    } else if (error.code === "ER_DUP_ENTRY") {
      errorMessage = "Data sudah ada (duplikat)";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      sqlCode: error.code,
    });
  }
};

// Update master data
exports.updateMasterData = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);

    // Build dynamic update query
    const updates = [];
    const values = [];

    // For dynamic tables, get actual column names from database
    const isDynamicTable = !tableConfig[type];
    let columnsToUpdate = config.columns;

    if (isDynamicTable) {
      // Query table structure to get allowed columns
      const [tableColumns] = await pool.query(
        `SHOW COLUMNS FROM ${config.tableName}`,
      );

      // Exclude auto-increment ID and timestamp columns
      const allowedColumns = tableColumns
        .map((col) => col.Field)
        .filter((field) => {
          const fieldLower = field.toLowerCase();
          return (
            field !== config.idField && // exclude ID fields
            fieldLower !== "created_at" &&
            fieldLower !== "updated_at" &&
            req.body[field] !== undefined
          ); // only fields present in request
        });

      columnsToUpdate = allowedColumns;
    }

    for (const col of columnsToUpdate) {
      if (req.body[col] !== undefined) {
        updates.push(`${col} = ?`);
        let val = req.body[col];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    }

    // Check for duplicate 'no' in eselon1 or 'no_urutan' in eselon2 (excluding current record)
    if (type === "eselon1" && req.body.no !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT eselon1_id FROM master_eselon1 WHERE no = ? AND eselon1_id != ?",
        [req.body.no, req.params.id],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }
    if (type === "eselon2" && req.body.no_urutan !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT eselon2_id FROM master_eselon2 WHERE no_urutan = ? AND eselon2_id != ?",
        [req.body.no_urutan, req.params.id],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no_urutan}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }
    if (type === "upt" && req.body.no_urutan !== undefined) {
      const [noCheck] = await pool.query(
        "SELECT upt_id FROM master_upt WHERE no_urutan = ? AND upt_id != ?",
        [req.body.no_urutan, req.params.id],
      );
      if (noCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No Urutan "${req.body.no_urutan}" sudah digunakan. Silakan pilih nomor lain.`,
        });
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada field yang diberikan untuk update",
      });
    }

    values.push(req.params.id);
    const sql = `UPDATE ${config.tableName} SET ${updates.join(", ")} WHERE ${config.idField} = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Master data tidak ditemukan",
      });
    }

    // Handle format_laporan_detail if type is format_laporan
    if (type === "format_laporan" && req.body.field_ids !== undefined) {
      // Clear existing details
      await pool.query(
        "DELETE FROM format_laporan_detail WHERE format_laporan_id = ?",
        [req.params.id],
      );

      let fieldIds = req.body.field_ids;
      if (typeof fieldIds === "string") {
        try {
          fieldIds = JSON.parse(fieldIds);
        } catch (e) {
          fieldIds = fieldIds.split(",").map((id) => id.trim());
        }
      }

      if (Array.isArray(fieldIds) && fieldIds.length > 0) {
        // Deduplicate fieldIds to prevent SQL Error (ER_DUP_ENTRY)
        fieldIds = [...new Set(fieldIds)];

        // VALIDATON: Only allow IDs that exist in master_laporan_field
        const [validFields] = await pool.query(
          "SELECT field_id FROM master_laporan_field WHERE field_id IN (?)",
          [fieldIds]
        );
        const validSet = new Set(validFields.map(f => f.field_id));
        fieldIds = fieldIds.filter(id => validSet.has(id));

        if (fieldIds.length > 0) {
          // Get parent_id for each field to determine grouping
          const [fieldInfo] = await pool.query(`
              SELECT field_id, parent_id
              FROM master_laporan_field
              WHERE field_id IN (?)
            `, [fieldIds]);

          const fieldMap = {};
          fieldInfo.forEach(f => {
            fieldMap[f.field_id] = f.parent_id;
          });

          // Get click order for individual fields (optional parameter)
          let clickOrder = {};
          if (req.body.field_click_order) {
            clickOrder = typeof req.body.field_click_order === 'string'
              ? JSON.parse(req.body.field_click_order)
              : req.body.field_click_order;
          }

          // Separate fields into groups
          const groupedFields = {}; // {parent_id: [field_ids]}
          const individualFields = []; // fields without parent

          fieldIds.forEach(fid => {
            const parentId = fieldMap[fid];
            if (parentId) {
              if (!groupedFields[parentId]) {
                groupedFields[parentId] = [];
              }
              groupedFields[parentId].push(fid);
            } else {
              individualFields.push(fid);
            }
          });

          // Sort individual fields by click order if available
          if (Object.keys(clickOrder).length > 0) {
            individualFields.sort((a, b) => {
              const orderA = clickOrder[a] || 999999;
              const orderB = clickOrder[b] || 999999;
              return orderA - orderB;
            });
          }

          // Build final ordered array
          // Groups should appear at the position of their FIRST clicked field
          const orderedFieldIds = [];
          const processedParents = new Set();

          // Create a combined list with click orders
          const allItems = [];

          // Add individual fields
          individualFields.forEach(fid => {
            allItems.push({
              type: 'individual',
              field_id: fid,
              click_order: clickOrder[fid] || 999999
            });
          });

          // Add groups (use click order of first field in group)
          Object.keys(groupedFields).forEach(parentId => {
            const groupFieldIds = groupedFields[parentId];
            // Find minimum click order in this group (first clicked field)
            let minClickOrder = 999999;
            groupFieldIds.forEach(fid => {
              if (clickOrder[fid] && clickOrder[fid] < minClickOrder) {
                minClickOrder = clickOrder[fid];
              }
            });

            allItems.push({
              type: 'group',
              parent_id: parentId,
              field_ids: groupFieldIds,
              click_order: minClickOrder
            });
          });

          // Sort all items by click order
          allItems.sort((a, b) => a.click_order - b.click_order);

          // Build final array
          allItems.forEach(item => {
            if (item.type === 'individual') {
              orderedFieldIds.push(item.field_id);
            } else if (item.type === 'group') {
              // Add all fields in this group (maintain tree order within group)
              orderedFieldIds.push(...item.field_ids);
            }
          });

          console.log('UPDATE - Original order:', fieldIds);
          console.log('UPDATE - Click order:', clickOrder);
          console.log('UPDATE - Final order:', orderedFieldIds);

          // Insert with order_index
          const detailValues = orderedFieldIds.map((fid, index) => [
            req.params.id, // format_laporan_id
            null, // parent_id
            null, // judul
            0, // is_header
            fid, // field_id
            index + 1, // order_index
          ]);

          await pool.query(
            "INSERT INTO format_laporan_detail (format_laporan_id, parent_id, judul, is_header, field_id, order_index) VALUES ?",
            [detailValues]
          );
        } // End if fieldIds.length > 0 check
      }
    }

    res.json({
      success: true,
      message: "Master data berhasil diupdate",
    });
  } catch (error) {
    const fs = require('fs');
    fs.appendFileSync('debug_log.txt', `\n[${new Date().toISOString()}] UPDATE ERROR:\nType: ${req.query.type}\nID: ${req.params.id}\nError: ${error.message}\nSQL: ${error.sqlMessage}\nStack: ${error.stack}\nBody Keys: ${Object.keys(req.body)}\nFieldIDs Length: ${req.body.field_ids ? req.body.field_ids.length : 'N/A'}\n`);

    console.error("=== ERROR UPDATE MASTER DATA ===");
    console.error("Type:", req.query.type);
    console.error("ID:", req.params.id);
    console.error("Body:", req.body);
    console.error("Error:", error);
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("SQL Message:", error.sqlMessage);

    res.status(500).json({
      success: false,
      message: "Error mengupdate master data: " + (error.sqlMessage || error.message),
      error: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
    });
  }
};

// Toggle status (Aktifkan/Nonaktifkan)
exports.toggleStatus = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);
    const { status_aktif } = req.body;

    // Check if table has status_aktif column
    if (!config.columns.includes("status_aktif")) {
      return res.status(400).json({
        success: false,
        message: "Tipe master data ini tidak mendukung toggle status",
      });
    }

    const sql = `UPDATE ${config.tableName} SET status_aktif = ? WHERE ${config.idField} = ?`;
    const [result] = await pool.query(sql, [status_aktif, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Master data tidak ditemukan",
      });
    }
    res.json({
      success: true,
      message: `Status berhasil diubah menjadi ${status_aktif ? "Aktif" : "Nonaktif"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengubah status",
      error: error.message,
    });
  }
};

// Delete master data
exports.deleteMasterData = async (req, res) => {
  try {
    const type = req.query.type || "eselon1";
    const config = getConfig(type);

    const [result] = await pool.query(
      `DELETE FROM ${config.tableName} WHERE ${config.idField} = ?`,
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Master data tidak ditemukan",
      });
    }
    res.json({
      success: true,
      message: "Master data berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menghapus master data",
      error: error.message,
    });
  }
};

// Get available types and their metadata
exports.getTypes = async (req, res) => {
  try {
    const types = Object.keys(tableConfig).map((key) => ({
      value: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      columns: tableConfig[key].columns,
      displayColumns: tableConfig[key].displayColumns,
    }));
    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil tipe master data",
      error: error.message,
    });
  }
};

// Get dropdown data untuk form pengguna
exports.getDropdownData = async (req, res) => {
  try {
    const { eselon1_id, eselon2_id } = req.query;
    console.log("=== GET DROPDOWN DATA ===");
    console.log("Query Params:", req.query);
    console.log("Eselon 1 ID requested:", eselon1_id);
    console.log("Eselon 2 ID requested:", eselon2_id);

    const [roles] = await pool.query("SELECT * FROM roles ORDER BY role_id");
    const [eselon1] = await pool.query(
      "SELECT * FROM master_eselon1 WHERE status_aktif = 1 ORDER BY nama_eselon1",
    );

    let eselon2Query = "SELECT * FROM master_eselon2 WHERE status_aktif = 1";
    const eselon2Params = [];

    if (eselon1_id) {
      eselon2Query += " AND eselon1_id = ?";
      eselon2Params.push(eselon1_id);
    }

    eselon2Query += " ORDER BY nama_eselon2";

    const [eselon2] = await pool.query(eselon2Query, eselon2Params);

    // Query untuk UPT dengan filter eselon1_id yang sama
    let uptQuery = "SELECT * FROM master_upt WHERE status_aktif = 1";
    const uptParams = [];

    if (eselon1_id) {
      uptQuery += " AND eselon1_id = ?";
      uptParams.push(eselon1_id);
    }

    uptQuery += " ORDER BY nama_upt";

    const [upt] = await pool.query(uptQuery, uptParams);

    // Fetch all master data needed for form dropdowns
    const [cara_akses] = await pool.query(
      "SELECT * FROM cara_akses WHERE status_aktif = 1 ORDER BY nama_cara_akses",
    );
    const [frekuensi_pemakaian] = await pool.query(
      "SELECT * FROM frekuensi_pemakaian WHERE status_aktif = 1 ORDER BY nama_frekuensi",
    );
    const [status_aplikasi] = await pool.query(
      "SELECT * FROM status_aplikasi ORDER BY nama_status",
    );
    const [pdn] = await pool.query(
      "SELECT * FROM pdn WHERE status_aktif = 1 ORDER BY kode_pdn",
    );
    const [environment] = await pool.query(
      "SELECT * FROM environment WHERE status_aktif = 1 ORDER BY jenis_environment",
    );

    // Query PIC Internal dengan filter eselon2_id
    let picInternalQuery = "SELECT * FROM pic_internal WHERE status_aktif = 1";
    const picInternalParams = [];

    if (eselon2_id) {
      picInternalQuery += " AND eselon2_id = ?";
      picInternalParams.push(eselon2_id);
    }

    picInternalQuery += " ORDER BY nama_pic_internal";

    const [pic_internal] = await pool.query(
      picInternalQuery,
      picInternalParams,
    );

    // Query PIC Eksternal dengan filter eselon2_id
    let picEksternalQuery =
      "SELECT * FROM pic_eksternal WHERE status_aktif = 1";
    const picEksternalParams = [];

    if (eselon2_id) {
      picEksternalQuery += " AND eselon2_id = ?";
      picEksternalParams.push(eselon2_id);
    }

    picEksternalQuery += " ORDER BY nama_pic_eksternal";

    const [pic_eksternal] = await pool.query(
      picEksternalQuery,
      picEksternalParams,
    );

    res.json({
      success: true,
      data: {
        roles,
        eselon1,
        eselon2,
        upt,
        cara_akses,
        frekuensi_pemakaian,
        status_aplikasi,
        pdn,
        environment,
        pic_internal,
        pic_eksternal,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data dropdown",
      error: error.message,
    });
  }
};
