const mysql = require("mysql2/promise");

async function addUptColumn() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kkp_db",
  });

  try {
    console.log("Menambahkan kolom upt_id ke tabel data_aplikasi...");

    // Tambah kolom upt_id
    await connection.execute(`
      ALTER TABLE data_aplikasi 
      ADD COLUMN upt_id BIGINT UNSIGNED NULL AFTER eselon2_id
    `);
    console.log("✓ Kolom upt_id berhasil ditambahkan");

    // Tambah index
    await connection.execute(`
      ALTER TABLE data_aplikasi 
      ADD INDEX upt_id (upt_id)
    `);
    console.log("✓ Index upt_id berhasil ditambahkan");

    // Tambah foreign key
    await connection.execute(`
      ALTER TABLE data_aplikasi 
      ADD CONSTRAINT data_aplikasi_ibfk_upt 
      FOREIGN KEY (upt_id) REFERENCES master_upt(upt_id) 
      ON DELETE RESTRICT 
      ON UPDATE RESTRICT
    `);
    console.log("✓ Foreign key constraint berhasil ditambahkan");

    console.log("\n✅ Migration selesai!");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("ℹ️  Kolom upt_id sudah ada, skip migration");
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addUptColumn().catch(console.error);
