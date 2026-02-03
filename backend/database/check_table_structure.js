const mysql = require("mysql2/promise");

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kkp_db",
  });

  try {
    console.log("Checking data_aplikasi table structure...\n");

    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM data_aplikasi
    `);

    console.log("Columns in data_aplikasi table:");
    console.log("=".repeat(80));
    columns.forEach((col, index) => {
      console.log(
        `${index + 1}. ${col.Field.padEnd(30)} | ${col.Type.padEnd(20)} | ${col.Null} | ${col.Key}`,
      );
    });
    console.log("=".repeat(80));
    console.log(`Total columns: ${columns.length}`);

    // Check for pdn_backup specifically
    const pdnBackup = columns.find(
      (c) => c.Field.toLowerCase() === "pdn_backup",
    );
    if (pdnBackup) {
      console.log("\n✅ pdn_backup column exists:", pdnBackup);
    } else {
      console.log("\n❌ pdn_backup column NOT found!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure().catch(console.error);
