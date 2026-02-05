const pool = require("./src/config/database");

async function checkTables() {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'master_%'");
    console.log("Master tables in database:");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkTables();
