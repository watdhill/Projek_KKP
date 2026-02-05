const pool = require("./src/config/database");

async function checkAdminUser() {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, email, nama, role_id, LENGTH(password) as pwd_length FROM users WHERE email = ?",
      ["admin@kkp.go.id"],
    );
    console.log("Admin user details:");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAdminUser();
