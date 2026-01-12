const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const masterDataRoutes = require("./routes/masterDataRoutes");
const aplikasiRoutes = require("./routes/aplikasiRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend berhasil jalan");
});

// Test database connection endpoint
app.get("/api/test-connection", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT 1 as test, DATABASE() as database_name');
    connection.release();
    
    res.json({
      success: true,
      message: "Database terhubung dengan sukses",
      data: {
        database: result[0].database_name,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal terhubung ke database",
      error: error.message
    });
  }
});

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/master-data", masterDataRoutes);
app.use("/api/aplikasi", aplikasiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/audit-log", auditLogRoutes);

module.exports = app;
