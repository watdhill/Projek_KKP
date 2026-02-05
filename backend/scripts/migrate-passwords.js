const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

async function migratePasswords() {
  console.log("🔐 Starting password migration to bcrypt...");

  try {
    // Get all users with plain text passwords (passwords that don't start with $2b$)
    const [users] = await pool.query(
      "SELECT user_id, email, password FROM users WHERE password NOT LIKE '$2b$%'",
    );

    console.log(`Found ${users.length} users with plain text passwords`);

    if (users.length === 0) {
      console.log("✅ All passwords are already hashed!");
      return;
    }

    let migrated = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Hash the existing plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);

        // Update the user with hashed password
        await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
          hashedPassword,
          user.user_id,
        ]);

        console.log(`✓ Migrated password for user: ${user.email}`);
        migrated++;
      } catch (error) {
        console.error(
          `✗ Failed to migrate password for user ${user.email}:`,
          error.message,
        );
        failed++;
      }
    }

    console.log(`\n📊 Migration completed!`);
    console.log(`✅ Successfully migrated: ${migrated} passwords`);
    console.log(`❌ Failed: ${failed} passwords`);

    if (failed === 0) {
      console.log(
        "\n🎉 All existing passwords have been successfully hashed with bcrypt!",
      );
      console.log("🔒 Future logins will use secure password comparison.");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run migration
migratePasswords();
