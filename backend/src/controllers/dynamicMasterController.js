const pool = require("../config/database");
const fs = require("fs").promises;
const path = require("path");

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
