const pool = require("./src/config/database");

async function checkJabatanStructure() {
  try {
    const [rows] = await pool.query("DESCRIBE master_jabatan");
    console.log("Structure of master_jabatan table:");
    console.log(JSON.stringify(rows, null, 2));

    const [data] = await pool.query("SELECT * FROM master_jabatan LIMIT 5");
    console.log("\nSample data:");
    console.log(JSON.stringify(data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkJabatanStructure();
