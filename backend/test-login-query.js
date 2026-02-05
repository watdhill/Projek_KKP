const pool = require("./src/config/database");

async function testLoginQuery() {
  try {
    const email = "admin@kkp.go.id";

    const query = `
      SELECT 
        u.user_id,
        u.nama,
        u.email,
        u.password,
        u.status_aktif,
        u.role_id,
        u.eselon1_id,
        u.eselon2_id,
        u.upt_id,
        r.nama_role,
        e1.nama_eselon1,
        e2.nama_eselon2,
        upt.nama_upt
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN master_eselon1 e1 ON u.eselon1_id = e1.eselon1_id
      LEFT JOIN master_eselon2 e2 ON u.eselon2_id = e2.eselon2_id
      LEFT JOIN master_upt upt ON u.upt_id = upt.upt_id
      WHERE u.email = ?
    `;

    const [rows] = await pool.query(query, [email]);

    console.log("Query result:");
    console.log(JSON.stringify(rows, null, 2));

    if (rows.length > 0) {
      console.log("\n✅ Login query successful");
      console.log("User:", rows[0].nama);
      console.log("Role:", rows[0].nama_role);
      console.log("Status aktif:", rows[0].status_aktif);
    } else {
      console.log("❌ No user found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Query error:", error);
    process.exit(1);
  }
}

testLoginQuery();
