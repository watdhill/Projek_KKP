const pool = require("../config/database");
const ExcelJS = require("exceljs");

// Get all audit logs with pagination and filters
exports.getAllAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    // Build filters
    const filters = [];
    const params = [];

    if (req.query.tableName) {
      filters.push("al.table_name LIKE ?");
      params.push(`%${req.query.tableName}%`);
    }

    if (req.query.action) {
      filters.push("al.action = ?");
      params.push(req.query.action);
    }

    if (req.query.userId) {
      filters.push("al.user_id = ?");
      params.push(req.query.userId);
    }

    if (req.query.startDate) {
      filters.push("DATE(al.created_at) >= ?");
      params.push(req.query.startDate);
    }

    if (req.query.endDate) {
      filters.push("DATE(al.created_at) <= ?");
      params.push(req.query.endDate);
    }

    if (req.query.search) {
      filters.push(
        "(al.detail LIKE ? OR al.description LIKE ? OR u.nama LIKE ?)"
      );
      const searchPattern = `%${req.query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const query = `
      SELECT 
        al.*,
        u.nama as user_name,
        u.email as user_email,
        r.nama_role as user_role
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${whereClause}
      ORDER BY al.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, pageSize, offset]);

    res.json({
      success: true,
      logs: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.json({
        success: true,
        logs: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
        warning: "Audit log belum tersedia (tabel audit_log belum ada)",
      });
    }
    console.error("Error getting audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Error mengambil audit log",
      error: error.message,
    });
  }
};

// Get audit logs by user
exports.getAuditLogsByUser = async (req, res) => {
  try {
    const query = `
      SELECT al.*, u.nama as user_name
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      WHERE al.user_id = ? 
      ORDER BY al.created_at DESC
    `;
    const [rows] = await pool.query(query, [req.params.userId]);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.json({
        success: true,
        data: [],
        warning: "Audit log belum tersedia (tabel audit_log belum ada)",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error mengambil audit log user",
      error: error.message,
    });
  }
};

// Create audit log
exports.createAuditLog = async (req, res) => {
  try {
    const { user_id, aksi, detail, ip_address } = req.body;
    const [result] = await pool.query(
      "INSERT INTO audit_log (user_id, aksi, detail, ip_address) VALUES (?, ?, ?, ?)",
      [user_id, aksi, detail, ip_address]
    );
    res.status(201).json({
      success: true,
      message: "Audit log berhasil ditambahkan",
      data: { id: result.insertId, user_id, aksi, detail, ip_address },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menambahkan audit log",
      error: error.message,
    });
  }
};

// Export audit logs to CSV/Excel
exports.exportAuditLogs = async (req, res) => {
  try {
    const format = req.query.format || "csv";

    // Build filters (same as getAllAuditLogs)
    const filters = [];
    const params = [];

    if (req.query.tableName) {
      filters.push("al.table_name LIKE ?");
      params.push(`%${req.query.tableName}%`);
    }

    if (req.query.action) {
      filters.push("al.action = ?");
      params.push(req.query.action);
    }

    if (req.query.userId) {
      filters.push("al.user_id = ?");
      params.push(req.query.userId);
    }

    if (req.query.startDate) {
      filters.push("DATE(al.created_at) >= ?");
      params.push(req.query.startDate);
    }

    if (req.query.endDate) {
      filters.push("DATE(al.created_at) <= ?");
      params.push(req.query.endDate);
    }

    if (req.query.search) {
      filters.push(
        "(al.detail LIKE ? OR al.description LIKE ? OR u.nama LIKE ?)"
      );
      const searchPattern = `%${req.query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const query = `
      SELECT 
        al.id,
        al.created_at as timestamp,
        al.table_name,
        al.action,
        al.user_id,
        u.nama as user_name,
        al.record_id,
        al.ip_address,
        al.user_agent,
        al.detail,
        al.description
      FROM audit_log al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT 10000
    `;
    const [rows] = await pool.query(query, params);

    if (format === "excel") {
      // Export to Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Audit Log");

      // Define columns
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Timestamp", key: "timestamp", width: 20 },
        { header: "Tabel", key: "table_name", width: 20 },
        { header: "Aksi", key: "action", width: 15 },
        { header: "User ID", key: "user_id", width: 10 },
        { header: "Nama User", key: "user_name", width: 25 },
        { header: "Username", key: "username", width: 20 },
        { header: "Record ID", key: "record_id", width: 15 },
        { header: "IP Address", key: "ip_address", width: 15 },
        { header: "Detail", key: "detail", width: 40 },
      ];

      // Add rows
      rows.forEach((row) => {
        worksheet.addRow({
          ...row,
          timestamp: row.timestamp
            ? new Date(row.timestamp).toLocaleString("id-ID")
            : "",
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2E8F0" },
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      res.send(buffer);
    } else {
      // Export to CSV
      const csvRows = [];
      csvRows.push(
        "ID,Timestamp,Tabel,Aksi,User ID,Nama User,Username,Record ID,IP Address,Detail"
      );

      rows.forEach((row) => {
        const values = [
          row.id,
          row.timestamp
            ? new Date(row.timestamp).toLocaleString("id-ID")
            : "",
          row.table_name || "",
          row.action || "",
          row.user_id || "",
          row.user_name || "",
          row.username || "",
          row.record_id || "",
          row.ip_address || "",
          `"${(row.detail || "").replace(/"/g, '""')}"`,
        ];
        csvRows.push(values.join(","));
      });

      const csv = csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      res.send("\uFEFF" + csv); // Add BOM for Excel compatibility
    }
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting audit log",
      error: error.message,
    });
  }
};
