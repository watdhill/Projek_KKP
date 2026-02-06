const pool = require("../config/database");
const fs = require("fs").promises;
const path = require("path");
const { logAudit, getIpAddress, getUserAgent } = require("../utils/auditLogger");

// Helper: Generate CREATE TABLE SQL dari definisi kolom
const generateCreateTableSQL = (tableName, columns, idField) => {
  const columnDefinitions = columns
    .map((col) => {
      let def = `\`${col.column_name}\` `;

      // Tipe data dengan length
      if (col.column_type === "VARCHAR") {
        def += `VARCHAR(${col.column_length || 200})`;
      } else if (col.column_type === "BIGINT") {
        def += "BIGINT UNSIGNED";
      } else if (col.column_type === "INT") {
        def += "INT";
      } else if (col.column_type === "DECIMAL") {
        def += `DECIMAL(${col.column_length || "10,2"})`;
      } else {
        def += col.column_type;
      }

      // Nullable
      def += col.is_nullable ? " NULL" : " NOT NULL";

      // Default value
      if (col.default_value) {
        if (col.column_type === "BOOLEAN") {
          def += ` DEFAULT ${col.default_value}`;
        } else {
          def += ` DEFAULT '${col.default_value}'`;
        }
      }

      // Unique constraint
      if (col.is_unique) {
        def += " UNIQUE";
      }

      return def;
    })
    .join(",\n  ");

  return `
CREATE TABLE IF NOT EXISTS \`${tableName}\` (
  \`${idField}\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ${columnDefinitions},
  \`status_aktif\` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Status: 1=Aktif, 0=Tidak Aktif',
  \`created_by\` INT NULL COMMENT 'User ID who created this record',
  \`updated_by\` INT NULL COMMENT 'User ID who last updated this record',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `.trim();
};

// Helper: Update dynamic table config file
const updateTableConfig = async (tableName, idField, columns) => {
  const configPath = path.join(__dirname, "../config/dynamicTableConfig.json");

  let config = {};
  try {
    const data = await fs.readFile(configPath, "utf8");
    config = JSON.parse(data);
  } catch (err) {
    // File tidak ada, buat baru
    config = {};
  }

  const columnNames = columns.map((c) => c.column_name);
  const displayColumns = columns.map((c) => c.display_name);

  // Tambahkan status_aktif jika ada
  if (!columnNames.includes("status_aktif")) {
    columnNames.push("status_aktif");
    displayColumns.push("Status");
  }

  config[tableName] = {
    tableName: tableName,
    idField: idField,
    columns: columnNames,
    displayColumns: displayColumns,
  };

  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");

  return config;
};

// Get table info with FK constraints
exports.getTableInfo = async (req, res) => {
  try {
    const { tableName } = req.params;

    const connection = await pool.getConnection();

    try {
      // Get table schema from registry
      const [tables] = await connection.query(
        'SELECT table_schema, table_relations FROM master_table_registry WHERE table_name = ? AND status_aktif = 1',
        [tableName]
      );

      if (tables.length === 0) {
        return res.status(404).json({ success: false, message: 'Table not found' });
      }

      let schema = typeof tables[0].table_schema === 'string'
        ? JSON.parse(tables[0].table_schema)
        : tables[0].table_schema;

      // Get ALL columns from INFORMATION_SCHEMA to check for missing ones (like FKs)
      const [dbColumns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
      `, [tableName]);

      // Get FK constraints
      const [fkInfo] = await connection.query(`
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [tableName]);

      const fkMap = {};
      fkInfo.forEach(fk => {
        fkMap[fk.COLUMN_NAME] = {
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumn: fk.REFERENCED_COLUMN_NAME
        };
      });

      // Merge DB columns into schema if missing
      dbColumns.forEach(dbCol => {
        // Skip system columns
        if (['created_by', 'updated_by', 'created_at', 'updated_at', 'status_aktif'].includes(dbCol.COLUMN_NAME)) return;
        // Skip ID column (usually handled separately or exists)
        if (dbCol.COLUMN_NAME === tableName + '_id' || (dbCol.COLUMN_NAME.endsWith('_id') && dbCol.COLUMN_KEY === 'PRI')) return;

        const exists = schema.find(s => s.column_name === dbCol.COLUMN_NAME);
        if (!exists) {
          // It's a missing column (likely an auto-added FK), add it to schema for frontend
          const displayName = dbCol.COLUMN_NAME
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace('Id', ''); // "Pdn Id" -> "Pdn "

          schema.push({
            column_name: dbCol.COLUMN_NAME,
            display_name: displayName.trim(),
            column_type: dbCol.DATA_TYPE.toUpperCase(),
            is_nullable: dbCol.IS_NULLABLE === 'YES'
          });
        }
      });

      // Enrich schema with FK info
      const enrichedSchema = schema.map(col => ({
        ...col,
        isForeignKey: !!fkMap[col.column_name],
        foreignKeyInfo: fkMap[col.column_name] || null
      }));

      res.json({
        success: true,
        data: {
          schema: enrichedSchema,
          foreignKeys: fkMap
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error getting table info:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all registered master tables
exports.getAllMasterTables = async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT 
        mtr.*,
        COUNT(mtc.column_id) as column_count
      FROM master_table_registry mtr
      LEFT JOIN master_table_columns mtc ON mtr.registry_id = mtc.registry_id
      WHERE mtr.status_aktif = 1
      GROUP BY mtr.registry_id
      ORDER BY mtr.created_at DESC
    `);

    res.json({ success: true, data: tables });
  } catch (error) {
    console.error("Error fetching master tables:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get columns for specific table
exports.getTableColumns = async (req, res) => {
  try {
    const { registryId } = req.params;

    const [columns] = await pool.query(
      `
      SELECT * FROM master_table_columns
      WHERE registry_id = ?
      ORDER BY display_order
    `,
      [registryId],
    );

    res.json({ success: true, data: columns });
  } catch (error) {
    console.error("Error fetching table columns:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new master table dynamically
exports.createMasterTable = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      table_name,
      display_name,
      id_field_name,
      columns,
      created_by,
      table_relations,
    } = req.body;

    // Validasi: table name harus lowercase, underscore only
    if (!/^[a-z0-9_]+$/.test(table_name)) {
      throw new Error(
        "Nama tabel harus huruf kecil, angka, dan hanya boleh menggunakan underscore (_)",
      );
    }

    // Validasi: id field name harus lowercase
    if (!/^[a-z0-9_]+$/.test(id_field_name)) {
      throw new Error(
        "Nama ID field harus huruf kecil, angka, dan hanya boleh menggunakan underscore (_)",
      );
    }

    // Validasi: minimal 1 kolom
    if (!columns || columns.length === 0) {
      throw new Error("Minimal harus ada 1 kolom");
    }

    // Validasi: semua column_name harus valid
    for (const col of columns) {
      if (!/^[a-z0-9_]+$/.test(col.column_name)) {
        throw new Error(
          `Nama kolom '${col.column_name}' tidak valid. Harus huruf kecil, angka, dan underscore saja`,
        );
      }
    }

    // Validasi: table belum ada di registry
    const [existing] = await connection.query(
      "SELECT registry_id FROM master_table_registry WHERE table_name = ?",
      [table_name],
    );

    if (existing.length > 0) {
      throw new Error("Nama tabel sudah digunakan");
    }

    // Validasi: table belum ada di database
    const [existingTable] = await connection.query("SHOW TABLES LIKE ?", [
      table_name,
    ]);

    if (existingTable.length > 0) {
      throw new Error(`Tabel '${table_name}' sudah ada di database`);
    }

    // Generate CREATE TABLE SQL
    const createTableSQL = generateCreateTableSQL(
      table_name,
      columns,
      id_field_name,
    );

    console.log("=== CREATING TABLE ===");
    console.log(createTableSQL);

    // Execute CREATE TABLE
    await connection.query(createTableSQL);

    console.log("✅ Table created successfully");

    // Add FK constraints for relationships (if any)
    if (table_relations && Array.isArray(table_relations) && table_relations.length > 0) {
      console.log("=== ADDING FOREIGN KEY CONSTRAINTS ===");

      // Mapping common table names to their PK columns
      const tablePKMap = {
        'frekuensi_pemakaian': 'frekuensi_pemakaian',
        'format_laporan': 'format_laporan_id',
        'master_eselon1': 'eselon1_id',
        'master_eselon2': 'eselon2_id',
        'master_upt': 'upt_id',
        'pdn': 'pdn_id',
        'cara_akses': 'cara_akses_id',
        'pic_internal': 'pic_internal_id',
        'pic_eksternal': 'pic_eksternal_id',
      };

      for (const relation of table_relations) {
        let column_name, referenced_table, referenced_column;

        // Handle both simple string (table name) and detailed object formats
        if (typeof relation === 'string') {
          // Simple format: just the table name
          referenced_table = relation;

          // Auto-detect PK column from map or query
          referenced_column = tablePKMap[referenced_table];

          // If not in map, try to query it
          if (!referenced_column) {
            try {
              const [pkInfo] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = ? 
                  AND COLUMN_KEY = 'PRI'
                LIMIT 1
              `, [referenced_table]);

              if (pkInfo.length > 0) {
                referenced_column = pkInfo[0].COLUMN_NAME;
              } else {
                console.warn(`⚠️ Could not find PK for table: ${referenced_table}`);
                continue;
              }
            } catch (pkError) {
              console.error(`❌ Error finding PK for ${referenced_table}:`, pkError.message);
              continue;
            }
          }

          // Create FK column name (e.g., "eselon1_id" for "master_eselon1")
          column_name = referenced_column;
        } else if (typeof relation === 'object') {
          // Detailed format: { column_name, referenced_table, referenced_column }
          column_name = relation.column_name;
          referenced_table = relation.referenced_table;
          referenced_column = relation.referenced_column;
        }

        if (!column_name || !referenced_table || !referenced_column) {
          console.warn(`⚠️ Skipping invalid relation:`, relation);
          continue;
        }

        // Check if column already exists in user's column definitions
        const columnExists = columns.some(col => col.column_name === column_name);

        if (!columnExists) {
          // Add the FK column to the table
          const columnType = referenced_column.includes('id') || referenced_column === 'frekuensi_pemakaian'
            ? 'BIGINT UNSIGNED'
            : 'VARCHAR(100)';

          try {
            await connection.query(`
              ALTER TABLE \`${table_name}\`
              ADD COLUMN \`${column_name}\` ${columnType} NULL
              COMMENT 'FK to ${referenced_table}'
            `);
            console.log(`✅ Added FK column: ${column_name}`);

            // ALSO ADD TO COLUMNS ARRAY so it gets saved to registry!
            columns.push({
              column_name: column_name,
              display_name: column_name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(' Id', ''),
              column_type: columnType.split(' ')[0], // BIGINT or VARCHAR
              is_nullable: true
            });

          } catch (colError) {
            console.error(`❌ Failed to add column ${column_name}:`, colError.message);
            continue;
          }
        }

        // Add FK constraint
        const constraintName = `fk_${table_name}_${referenced_table}`;
        const alterSQL = `
          ALTER TABLE \`${table_name}\`
          ADD CONSTRAINT \`${constraintName}\`
          FOREIGN KEY (\`${column_name}\`)
          REFERENCES \`${referenced_table}\`(\`${referenced_column}\`)
          ON UPDATE CASCADE
          ON DELETE SET NULL
        `.trim();

        try {
          await connection.query(alterSQL);
          console.log(`✅ FK constraint added: ${table_name}.${column_name} -> ${referenced_table}.${referenced_column}`);
        } catch (fkError) {
          console.error(`❌ Failed to add FK constraint for ${column_name}:`, fkError.message);
        }
      }
    }

    // Add relationship column to data_aplikasi
    console.log("=== ADDING COLUMN TO data_aplikasi ===");
    const dataAplikasiColumnName = `${table_name}_id`;
    const dataAplikasiFK = `fk_data_aplikasi_${table_name}`;

    try {
      await connection.query(`
        ALTER TABLE \`data_aplikasi\`
        ADD COLUMN \`${dataAplikasiColumnName}\` BIGINT UNSIGNED NULL
        COMMENT 'Relasi ke ${display_name}'
      `);

      await connection.query(`
        ALTER TABLE \`data_aplikasi\`
        ADD CONSTRAINT \`${dataAplikasiFK}\`
        FOREIGN KEY (\`${dataAplikasiColumnName}\`)
        REFERENCES \`${table_name}\`(\`${id_field_name}\`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
      `);

      console.log(`✅ Added column and FK to data_aplikasi: ${dataAplikasiColumnName}`);
    } catch (daError) {
      if (daError.code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️ Column ${dataAplikasiColumnName} already exists in data_aplikasi`);
      } else {
        console.error(`❌ Failed to add data_aplikasi relation:`, daError.message);
      }
    }

    // Insert to registry
    const [registryResult] = await connection.query(
      `INSERT INTO master_table_registry 
       (table_name, display_name, id_field_name, table_schema, table_relations, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        table_name,
        display_name,
        id_field_name,
        JSON.stringify(columns),
        table_relations ? JSON.stringify(table_relations) : null,
        created_by || "admin",
      ],
    );

    const registryId = registryResult.insertId;

    // Insert columns definition
    const columnValues = columns.map((col, index) => [
      registryId,
      col.column_name,
      col.display_name,
      col.column_type,
      col.column_length || null,
      col.is_nullable !== false, // default true
      col.default_value || null,
      col.is_unique || false,
      index,
    ]);

    await connection.query(
      `INSERT INTO master_table_columns 
       (registry_id, column_name, display_name, column_type, column_length, is_nullable, default_value, is_unique, display_order) 
       VALUES ?`,
      [columnValues],
    );

    // Update dynamic config file
    await updateTableConfig(table_name, id_field_name, columns);

    await connection.commit();

    console.log(`✅ Tabel '${table_name}' berhasil dibuat`);

    res.status(201).json({
      success: true,
      message: `Tabel '${table_name}' berhasil dibuat`,
      data: {
        registry_id: registryId,
        table_name,
        sql: createTableSQL,
      },
    });
    
    // Log audit untuk CREATE dynamic table
    await logAudit({
      userId: req.user?.userId,
      tableName: 'master_table_registry',
      action: 'CREATE',
      recordId: registryId,
      newValues: { table_name, display_name, id_field_name },
      detail: `Dynamic table created: ${table_name}`,
      description: `Tabel dinamis ${table_name} berhasil dibuat`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error creating table:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Update master table (ALTER TABLE for schema changes)
exports.updateMasterTable = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { registryId } = req.params;
    const { display_name, columns, updated_by, table_relations } = req.body;

    // Get existing table info
    const [existingTables] = await connection.query(
      "SELECT table_name, id_field_name, table_schema FROM master_table_registry WHERE registry_id = ?",
      [registryId],
    );

    if (existingTables.length === 0) {
      throw new Error("Tabel tidak ditemukan di registry");
    }

    const tableName = existingTables[0].table_name;
    const idFieldName = existingTables[0].id_field_name;
    const oldSchema = JSON.parse(existingTables[0].table_schema);

    // Validasi: minimal 1 kolom
    if (!columns || columns.length === 0) {
      throw new Error("Minimal harus ada 1 kolom");
    }

    // Validasi: semua column_name harus valid
    for (const col of columns) {
      if (!/^[a-z0-9_]+$/.test(col.column_name)) {
        throw new Error(
          `Nama kolom '${col.column_name}' tidak valid. Harus huruf kecil, angka, dan underscore saja`,
        );
      }
    }

    console.log("=== UPDATING TABLE SCHEMA ===");
    console.log("Table:", tableName);

    // Bandingkan schema lama dan baru untuk generate ALTER TABLE
    const oldColumns = oldSchema.map((c) => c.column_name);
    const newColumns = columns.map((c) => c.column_name);

    const alterStatements = [];

    // 1. ADD kolom baru
    for (const col of columns) {
      if (!oldColumns.includes(col.column_name)) {
        let def = `ADD COLUMN \`${col.column_name}\` `;

        if (col.column_type === "VARCHAR") {
          def += `VARCHAR(${col.column_length || 200})`;
        } else if (col.column_type === "BIGINT") {
          def += "BIGINT UNSIGNED";
        } else if (col.column_type === "INT") {
          def += "INT";
        } else if (col.column_type === "DECIMAL") {
          def += `DECIMAL(${col.column_length || "10,2"})`;
        } else {
          def += col.column_type;
        }

        def += col.is_nullable ? " NULL" : " NOT NULL";

        if (col.default_value) {
          if (col.column_type === "BOOLEAN") {
            def += ` DEFAULT ${col.default_value}`;
          } else {
            def += ` DEFAULT '${col.default_value}'`;
          }
        }

        if (col.is_unique) {
          def += " UNIQUE";
        }

        alterStatements.push(def);
        console.log("+ ADD:", col.column_name);
      }
    }

    // 2. DROP kolom yang dihapus
    for (const oldColName of oldColumns) {
      if (!newColumns.includes(oldColName)) {
        alterStatements.push(`DROP COLUMN \`${oldColName}\``);
        console.log("- DROP:", oldColName);
      }
    }

    // 3. MODIFY kolom yang berubah (type, length, nullable, dll)
    for (const newCol of columns) {
      const oldCol = oldSchema.find(
        (c) => c.column_name === newCol.column_name,
      );
      if (oldCol) {
        // Cek apakah ada perubahan
        const hasChange =
          oldCol.column_type !== newCol.column_type ||
          oldCol.column_length !== newCol.column_length ||
          oldCol.is_nullable !== newCol.is_nullable ||
          oldCol.default_value !== newCol.default_value ||
          oldCol.is_unique !== newCol.is_unique;

        if (hasChange) {
          let def = `MODIFY COLUMN \`${newCol.column_name}\` `;

          if (newCol.column_type === "VARCHAR") {
            def += `VARCHAR(${newCol.column_length || 200})`;
          } else if (newCol.column_type === "BIGINT") {
            def += "BIGINT UNSIGNED";
          } else if (newCol.column_type === "INT") {
            def += "INT";
          } else if (newCol.column_type === "DECIMAL") {
            def += `DECIMAL(${newCol.column_length || "10,2"})`;
          } else {
            def += newCol.column_type;
          }

          def += newCol.is_nullable ? " NULL" : " NOT NULL";

          if (newCol.default_value) {
            if (newCol.column_type === "BOOLEAN") {
              def += ` DEFAULT ${newCol.default_value}`;
            } else {
              def += ` DEFAULT '${newCol.default_value}'`;
            }
          }

          if (newCol.is_unique) {
            def += " UNIQUE";
          }

          alterStatements.push(def);
          console.log("~ MODIFY:", newCol.column_name);
        }
      }
    }

    // Execute ALTER TABLE jika ada perubahan
    if (alterStatements.length > 0) {
      const alterSQL = `ALTER TABLE \`${tableName}\`\n  ${alterStatements.join(",\n  ")}`;
      console.log("\n" + alterSQL + "\n");
      await connection.query(alterSQL);
    } else {
      console.log("No schema changes detected");
    }

    // Pastikan kolom status_aktif ada (untuk tabel yang dibuat sebelum update ini)
    const [existingColumns] = await connection.query(
      "SHOW COLUMNS FROM ?? LIKE 'status_aktif'",
      [tableName],
    );

    if (existingColumns.length === 0) {
      console.log("+ Adding status_aktif column to existing table");
      await connection.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN \`status_aktif\` BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Status: 1=Aktif, 0=Tidak Aktif'`,
      );
    }

    // Update registry
    await connection.query(
      `UPDATE master_table_registry 
       SET display_name = ?, table_schema = ?, table_relations = ?, updated_at = NOW() 
       WHERE registry_id = ?`,
      [
        display_name,
        JSON.stringify(columns),
        table_relations ? JSON.stringify(table_relations) : null,
        registryId,
      ],
    );

    // Delete old column definitions
    await connection.query(
      "DELETE FROM master_table_columns WHERE registry_id = ?",
      [registryId],
    );

    // Insert new column definitions
    const columnValues = columns.map((col, index) => [
      registryId,
      col.column_name,
      col.display_name,
      col.column_type,
      col.column_length || null,
      col.is_nullable !== false,
      col.default_value || null,
      col.is_unique || false,
      index,
    ]);

    await connection.query(
      `INSERT INTO master_table_columns 
       (registry_id, column_name, display_name, column_type, column_length, is_nullable, default_value, is_unique, display_order) 
       VALUES ?`,
      [columnValues],
    );

    // Update dynamic config file
    await updateTableConfig(tableName, idFieldName, columns);

    await connection.commit();

    console.log(`✅ Tabel '${tableName}' berhasil diupdate`);

    res.json({
      success: true,
      message: `Tabel '${tableName}' berhasil diupdate`,
      data: {
        registry_id: registryId,
        table_name: tableName,
        alterations: alterStatements.length,
      },
    });
    
    // Log audit untuk UPDATE dynamic table
    await logAudit({
      userId: req.user?.userId,
      tableName: 'master_table_registry',
      action: 'UPDATE',
      recordId: registryId,
      newValues: { table_name: tableName, display_name: displayName, id_field_name: idFieldName },
      changes: 'schema update',
      detail: `Dynamic table updated: ${tableName}`,
      description: `Tabel dinamis ${tableName} berhasil diupdate`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error updating table:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Delete master table (DROP TABLE)
exports.deleteMasterTable = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { registryId } = req.params;

    // Get table info
    const [tables] = await connection.query(
      "SELECT table_name FROM master_table_registry WHERE registry_id = ?",
      [registryId],
    );

    if (tables.length === 0) {
      throw new Error("Tabel tidak ditemukan di registry");
    }

    const tableName = tables[0].table_name;

    console.log(`⚠️  DROPPING TABLE: ${tableName}`);

    // 1. Find all Foreign Keys referencing this table
    const [references] = await connection.query(
      `SELECT 
        TABLE_NAME, 
        CONSTRAINT_NAME,
        COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
         AND REFERENCED_TABLE_NAME = ?`,
      [tableName]
    );

    if (references.length > 0) {
      console.log(`Found ${references.length} references to cleanup...`);

      for (const ref of references) {
        console.log(`- Removing FK ${ref.CONSTRAINT_NAME} from ${ref.TABLE_NAME}`);

        // Drop FK Constraint
        try {
          await connection.query(
            `ALTER TABLE \`${ref.TABLE_NAME}\` DROP FOREIGN KEY \`${ref.CONSTRAINT_NAME}\``
          );
        } catch (err) {
          console.warn(`  Warning: Failed to drop FK ${ref.CONSTRAINT_NAME}: ${err.message}`);
        }

        // Drop Column (Optional - prevents zombie columns)
        // Only drop if it looks like a relation column (ends with _id or matches table name)
        if (ref.COLUMN_NAME.endsWith('_id')) {
          console.log(`- Dropping column ${ref.COLUMN_NAME} from ${ref.TABLE_NAME}`);
          try {
            await connection.query(
              `ALTER TABLE \`${ref.TABLE_NAME}\` DROP COLUMN \`${ref.COLUMN_NAME}\``
            );
          } catch (err) {
            console.warn(`  Warning: Failed to drop column ${ref.COLUMN_NAME}: ${err.message}`);
          }
        }
      }
    }

    // DROP TABLE (HATI-HATI!)
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);

    // Delete from registry (cascade akan delete columns juga)
    await connection.query(
      "DELETE FROM master_table_registry WHERE registry_id = ?",
      [registryId],
    );

    // Update config file - hapus entry
    const configPath = path.join(
      __dirname,
      "../config/dynamicTableConfig.json",
    );
    try {
      const data = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(data);
      delete config[tableName];
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
    } catch (err) {
      console.warn("Warning: Could not update config file:", err.message);
    }

    await connection.commit();

    console.log(`✅ Tabel '${tableName}' berhasil dihapus`);

    res.json({
      success: true,
      message: `Tabel '${tableName}' dan semua datanya berhasil dihapus`,
    });
    
    // Log audit untuk DELETE dynamic table
    await logAudit({
      userId: req.user?.userId,
      tableName: 'master_table_registry',
      action: 'DELETE',
      recordId: registryId,
      detail: `Dynamic table deleted: ${tableName}`,
      description: `Tabel dinamis ${tableName} berhasil dihapus`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error deleting table:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Reload table config (tanpa restart server)
exports.reloadTableConfig = async (req, res) => {
  try {
    const configPath = path.join(
      __dirname,
      "../config/dynamicTableConfig.json",
    );

    // Clear require cache
    delete require.cache[require.resolve(configPath)];

    let config = {};
    try {
      const data = await fs.readFile(configPath, "utf8");
      config = JSON.parse(data);
    } catch (err) {
      config = {};
    }

    res.json({
      success: true,
      message: "Konfigurasi tabel berhasil di-reload",
      data: config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available types (untuk dropdown di master data section)
exports.getAvailableTypes = async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT table_name, display_name 
      FROM master_table_registry 
      WHERE status_aktif = 1
      ORDER BY display_name
    `);

    res.json({
      success: true,
      data: tables.map((t) => ({ key: t.table_name, label: t.display_name })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
