const mysql = require("mysql2/promise");

async function addPdnBackupColumn() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kkp_db",
  });

  try {
    console.log("Menambahkan kolom pdn_backup ke tabel data_aplikasi...");

    // Tambah kolom pdn_backup jika belum ada
    await connection.execute(`
      ALTER TABLE data_aplikasi 
      ADD COLUMN pdn_backup VARCHAR(200) NULL AFTER pdn_id
    `);
    console.log("✓ Kolom pdn_backup berhasil ditambahkan");

    console.log("\n✅ Migration selesai!");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("ℹ️  Kolom pdn_backup sudah ada, skip migration");
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addPdnBackupColumn().catch(console.error);
