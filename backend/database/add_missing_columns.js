const mysql = require("mysql2/promise");

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kkp_db",
  });

  try {
    console.log("Menambahkan kolom yang hilang...\n");

    // Add ssl_expired column
    try {
      await connection.execute(`
        ALTER TABLE data_aplikasi 
        ADD COLUMN ssl_expired DATE NULL AFTER \`ssl\`
      `);
      console.log("✓ Kolom ssl_expired berhasil ditambahkan");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  Kolom ssl_expired sudah ada");
      } else {
        throw e;
      }
    }

    // Add waf_lainnya column if needed
    try {
      await connection.execute(`
        ALTER TABLE data_aplikasi 
        ADD COLUMN waf_lainnya VARCHAR(200) NULL AFTER \`waf\`
      `);
      console.log("✓ Kolom waf_lainnya berhasil ditambahkan");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  Kolom waf_lainnya sudah ada");
      } else {
        throw e;
      }
    }

    console.log("\n✅ Migration selesai!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addMissingColumns().catch(console.error);
