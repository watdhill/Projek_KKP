const pool = require("./src/config/database");
const bcrypt = require("bcrypt");

async function testLogin() {
  try {
    const email = "admin@kkp.go.id";
    const password = "Admin123!";

    const [rows] = await pool.query(
      "SELECT user_id, email, password FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      console.log("❌ User not found");
      process.exit(1);
    }

    const user = rows[0];
    console.log("User found:", user.email);
    console.log("Password hash length:", user.password.length);

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValid);

    if (isValid) {
      console.log("✅ Login credentials are correct!");
    } else {
      console.log("❌ Password mismatch");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testLogin();
