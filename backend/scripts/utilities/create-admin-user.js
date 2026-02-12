const pool = require("./src/config/database");
const bcrypt = require("bcrypt");

async function createAdminUser() {
  try {
    // Check existing admin users
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE role_id = 1",
    );
    console.log("Existing admin users:", existingUsers.length);

    // Create new admin user
    const password = "Admin123!";
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (role_id, nama, email, password, status_aktif, nip, jabatan, kontak)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        "Administrator Baru",
        "admin@kkp.go.id",
        hashedPassword,
        1,
        "199001012020011001",
        "Administrator",
        "081234567890",
      ],
    );

    console.log("\n✅ Admin user created successfully!");
    console.log("User ID:", result.insertId);
    console.log("Email: admin@kkp.go.id");
    console.log("Password:", password);
    console.log("\nPlease save this password and change it after first login.");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
