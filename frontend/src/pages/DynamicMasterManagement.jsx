import { useState, useEffect } from "react";

function DynamicMasterManagement() {
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTable, setEditingTable] = useState(null); // Track editing state
  const [availableTables, setAvailableTables] = useState([]); // All available tables for relations
  const [formData, setFormData] = useState({
    table_name: "",
    display_name: "",
    id_field_name: "",
    table_relations: [], // Array of related table names
    columns: [],
  });

  useEffect(() => {
    fetchTables();
    fetchAvailableTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/dynamic-master/tables",
      );
      const result = await res.json();
      if (result.success) setTables(result.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      // Static tables (hardcoded master data yang sudah ada)
      const staticTables = [
        { value: "eselon1", label: "Eselon 1" },
        { value: "eselon2", label: "Eselon 2" },
        { value: "unitkerja", label: "Unit Kerja" },
        { value: "upt", label: "UPT" },
        { value: "jenis_aplikasi", label: "Jenis Aplikasi" },
        { value: "platform", label: "Platform" },
        { value: "database", label: "Database" },
        { value: "bahasa_pemrograman", label: "Bahasa Pemrograman" },
        { value: "framework", label: "Framework" },
        { value: "web_server", label: "Web Server" },
        { value: "hosting", label: "Hosting" },
        { value: "lisensi", label: "Lisensi" },
      ];

      // Dynamic tables
      const res = await fetch(
        "http://localhost:5000/api/dynamic-master/tables",
      );
      const result = await res.json();

      let dynamicTables = [];
      if (result.success) {
        dynamicTables = result.data.map((t) => ({
          value: t.table_name,
          label: t.display_name,
        }));
      }

      // Gabungkan static + dynamic tables
      setAvailableTables([...staticTables, ...dynamicTables]);
    } catch (err) {
      console.error("Error fetching available tables:", err);
    }
  };

  const addColumn = () => {
    setFormData({
      ...formData,
      columns: [
        ...formData.columns,
        {
          column_name: "",
          display_name: "",
          column_type: "VARCHAR",
          column_length: 200,
          is_nullable: true,
          is_unique: false,
          default_value: "",
        },
      ],
    });
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...formData.columns];
    newColumns[index][field] = value;

    // Auto-clear column_length jika tipe tidak perlu panjang
    if (field === "column_type") {
      if (!["VARCHAR", "DECIMAL"].includes(value)) {
        newColumns[index].column_length = null;
      } else if (value === "VARCHAR" && !newColumns[index].column_length) {
        newColumns[index].column_length = 200; // Default
      } else if (value === "DECIMAL" && !newColumns[index].column_length) {
        newColumns[index].column_length = 10; // Default precision
      }
    }

    setFormData({ ...formData, columns: newColumns });
  };

  const removeColumn = (index) => {
    setFormData({
      ...formData,
      columns: formData.columns.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.columns.length === 0) {
      alert("Tambahkan minimal 1 kolom");
      return;
    }

    // Validasi: semua kolom harus diisi
    for (const col of formData.columns) {
      if (!col.column_name || !col.display_name) {
        alert("Semua nama kolom dan display name harus diisi");
        return;
      }
    }

    try {
      const url = editingTable
        ? `http://localhost:5000/api/dynamic-master/tables/${editingTable.registry_id}`
        : "http://localhost:5000/api/dynamic-master/tables";

      const method = editingTable ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          created_by: localStorage.getItem("userName") || "admin",
          updated_by: localStorage.getItem("userName") || "admin",
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          editingTable
            ? `✅ Tabel berhasil diupdate!\n\nNama: ${result.data.table_name}`
            : `✅ Tabel berhasil dibuat!\n\nNama: ${result.data.table_name}\n\nTabel ini sekarang bisa digunakan di halaman Master Data.`,
        );
        fetchTables();
        setShowModal(false);
        setEditingTable(null);
        setFormData({
          table_name: "",
          display_name: "",
          id_field_name: "",
          table_relations: [],
          columns: [],
        });
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);

    // Parse table_schema JSON
    const schema =
      typeof table.table_schema === "string"
        ? JSON.parse(table.table_schema)
        : table.table_schema;

    // Parse table_relations JSON
    const relations = table.table_relations
      ? typeof table.table_relations === "string"
        ? JSON.parse(table.table_relations)
        : table.table_relations
      : [];

    setFormData({
      table_name: table.table_name,
      display_name: table.display_name,
      id_field_name: table.id_field_name,
      table_relations: relations,
      columns: schema.map((col) => ({
        column_name: col.column_name,
        display_name: col.display_name,
        column_type: col.column_type,
        column_length: col.column_length,
        is_nullable: col.is_nullable,
        is_unique: col.is_unique,
        default_value: col.default_value || "",
      })),
    });

    setShowModal(true);
  };

  const handleDelete = async (registryId, tableName) => {
    const confirmed = window.confirm(
      `⚠️ PERINGATAN!\n\nTabel '${tableName}' dan SEMUA DATA di dalamnya akan dihapus PERMANEN.\n\nHapus data ini tidak bisa di-undo!\n\nLanjutkan hapus?`,
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/dynamic-master/tables/${registryId}`,
        {
          method: "DELETE",
        },
      );

      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        fetchTables();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => (window.location.href = "/admin/master-data")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          background: "transparent",
          color: "#64748b",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "16px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#f8fafc";
          e.target.style.color = "#1e293b";
          e.target.style.borderColor = "#cbd5e1";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "#64748b";
          e.target.style.borderColor = "#e2e8f0";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Kembali ke Master Data
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          padding: "18px 22px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "14px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                marginBottom: "3px",
                fontSize: "20px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Kelola Jenis Master Data
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              Buat tabel master data baru secara otomatis
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 14px rgba(79, 70, 229, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(79, 70, 229, 0.3)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Tambah Jenis Baru
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p style={{ marginTop: "16px", color: "#64748b" }}>Memuat data...</p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <th
                  style={{
                    padding: "14px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Nama Tabel
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Display Name
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  ID Field
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Relasi
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Jumlah Kolom
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Dibuat
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table, index) => (
                <tr
                  key={table.registry_id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: index % 2 === 0 ? "#fff" : "#fafbfc",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f9ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      index % 2 === 0 ? "#fff" : "#fafbfc")
                  }
                >
                  <td
                    style={{
                      padding: "14px",
                      fontFamily: "monospace",
                      color: "#10b981",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {table.table_name}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      fontWeight: 500,
                      fontSize: "13px",
                    }}
                  >
                    {table.display_name}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {table.id_field_name}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {table.table_relations ? (
                      (() => {
                        const relations =
                          typeof table.table_relations === "string"
                            ? JSON.parse(table.table_relations)
                            : table.table_relations;
                        return relations && relations.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {relations.map((rel) => (
                              <span
                                key={rel}
                                style={{
                                  background: "#e0e7ff",
                                  color: "#4338ca",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                }}
                              >
                                {rel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>-</span>
                        );
                      })()
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>-</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {table.column_count}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {new Date(table.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(table)}
                        style={{
                          padding: "6px 14px",
                          background:
                            "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 6px rgba(251, 191, 36, 0.25)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 10px rgba(251, 191, 36, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 6px rgba(251, 191, 36, 0.25)";
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(table.registry_id, table.table_name)
                        }
                        style={{
                          padding: "6px 14px",
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 6px rgba(239, 68, 68, 0.25)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 10px rgba(239, 68, 68, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 6px rgba(239, 68, 68, 0.25)";
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "60px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 16px",
                        background:
                          "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "15px",
                      }}
                    >
                      Belum ada jenis master data dinamis
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      Klik "Tambah Jenis Baru" untuk membuat tabel pertama
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {editingTable
                  ? "Edit Jenis Master Data"
                  : "Tambah Jenis Master Data Baru"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  Informasi Dasar
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#374151",
                      }}
                    >
                      Nama Tabel <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.table_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          table_name: e.target.value.toLowerCase(),
                        })
                      }
                      pattern="[a-z0-9_]+"
                      placeholder="contoh: master_jabatan atau master_eselon2"
                      required
                      disabled={!!editingTable}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: "monospace",
                        boxSizing: "border-box",
                        backgroundColor: editingTable ? "#f9fafb" : "white",
                        cursor: editingTable ? "not-allowed" : "text",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        if (!editingTable) {
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(79, 70, 229, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#64748b",
                        fontSize: "11px",
                      }}
                    >
                      Huruf kecil, angka, dan underscore saja
                    </small>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#374151",
                      }}
                    >
                      Display Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      placeholder="contoh: Jabatan"
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4f46e5";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(79, 70, 229, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#64748b",
                        fontSize: "11px",
                      }}
                    >
                      Nama untuk ditampilkan di menu
                    </small>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    ID Field Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.id_field_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        id_field_name: e.target.value.toLowerCase(),
                      })
                    }
                    pattern="[a-z0-9_]+"
                    placeholder="contoh: jabatan_id atau eselon2_id"
                    required
                    disabled={!!editingTable}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                      backgroundColor: editingTable ? "#f9fafb" : "white",
                      cursor: editingTable ? "not-allowed" : "text",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      if (!editingTable) {
                        e.target.style.borderColor = "#4f46e5";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(79, 70, 229, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#64748b",
                      fontSize: "11px",
                    }}
                  >
                    Nama kolom primary key (auto increment)
                  </small>
                </div>

                {/* Table Relations */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    Relasi Tabel
                  </label>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      backgroundColor: "#ffffff",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {/* Option: Tidak Ada Relasi */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "6px",
                          transition: "background 0.2s",
                          fontSize: "13px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <input
                          type="checkbox"
                          checked={formData.table_relations.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                table_relations: [],
                              });
                            }
                          }}
                          style={{
                            width: "16px",
                            height: "16px",
                            marginRight: "8px",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                          Tidak Ada Relasi
                        </span>
                      </label>

                      {/* Available Tables */}
                      {availableTables.map((table) => (
                        <label
                          key={table.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "6px",
                            transition: "background 0.2s",
                            fontSize: "13px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <input
                            type="checkbox"
                            value={table.value}
                            checked={formData.table_relations.includes(
                              table.value,
                            )}
                            onChange={(e) => {
                              const value = e.target.value;
                              let newRelations;
                              if (e.target.checked) {
                                newRelations = [
                                  ...formData.table_relations,
                                  value,
                                ];
                              } else {
                                newRelations = formData.table_relations.filter(
                                  (r) => r !== value,
                                );
                              }
                              setFormData({
                                ...formData,
                                table_relations: newRelations,
                              });
                            }}
                            style={{
                              width: "16px",
                              height: "16px",
                              marginRight: "8px",
                              cursor: "pointer",
                            }}
                          />
                          <span style={{ color: "#374151" }}>
                            {table.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#64748b",
                      fontSize: "11px",
                    }}
                  >
                    Pilih tabel yang berelasi (bisa lebih dari satu, atau pilih
                    "Tidak Ada Relasi")
                  </small>
                </div>
              </div>

              {/* Columns Definition */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                    Definisi Kolom
                  </h3>
                  <button
                    type="button"
                    onClick={addColumn}
                    style={{
                      padding: "8px 16px",
                      background:
                        "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow =
                        "0 4px 10px rgba(79, 70, 229, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 6px rgba(79, 70, 229, 0.25)";
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Tambah Kolom
                  </button>
                </div>

                {formData.columns.map((col, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "12px",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Nama Kolom <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={col.column_name}
                          onChange={(e) =>
                            updateColumn(
                              index,
                              "column_name",
                              e.target.value.toLowerCase(),
                            )
                          }
                          placeholder="nama_jabatan atau eselon2_id"
                          pattern="[a-z0-9_]+"
                          required
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "all 0.2s",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(79, 70, 229, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e2e8f0";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Display Name{" "}
                          <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={col.display_name}
                          onChange={(e) =>
                            updateColumn(index, "display_name", e.target.value)
                          }
                          placeholder="Nama Jabatan"
                          required
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "all 0.2s",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(79, 70, 229, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e2e8f0";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Tipe Data
                        </label>
                        <select
                          value={col.column_type}
                          onChange={(e) =>
                            updateColumn(index, "column_type", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="VARCHAR">VARCHAR (Teks)</option>
                          <option value="TEXT">TEXT (Teks Panjang)</option>
                          <option value="INT">INT (Angka Bulat)</option>
                          <option value="BIGINT">BIGINT (Angka Besar)</option>
                          <option value="DECIMAL">DECIMAL (Desimal)</option>
                          <option value="DATE">DATE (Tanggal)</option>
                          <option value="BOOLEAN">BOOLEAN (Ya/Tidak)</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Panjang/Size
                        </label>
                        <input
                          type="number"
                          value={col.column_length}
                          onChange={(e) =>
                            updateColumn(index, "column_length", e.target.value)
                          }
                          placeholder={
                            col.column_type === "VARCHAR"
                              ? "200"
                              : col.column_type === "DECIMAL"
                                ? "10,2"
                                : "Tidak diperlukan"
                          }
                          disabled={
                            !["VARCHAR", "DECIMAL"].includes(col.column_type)
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                            backgroundColor: !["VARCHAR", "DECIMAL"].includes(
                              col.column_type,
                            )
                              ? "#f1f5f9"
                              : "#fff",
                            cursor: !["VARCHAR", "DECIMAL"].includes(
                              col.column_type,
                            )
                              ? "not-allowed"
                              : "text",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Default Value
                        </label>
                        <input
                          type="text"
                          value={col.default_value || ""}
                          onChange={(e) =>
                            updateColumn(index, "default_value", e.target.value)
                          }
                          placeholder="(opsional)"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={col.is_nullable}
                          onChange={(e) =>
                            updateColumn(index, "is_nullable", e.target.checked)
                          }
                        />
                        Boleh Kosong (Nullable)
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={col.is_unique}
                          onChange={(e) =>
                            updateColumn(index, "is_unique", e.target.checked)
                          }
                        />
                        Unik (Unique)
                      </label>
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        style={{
                          marginLeft: "auto",
                          padding: "6px 12px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}

                {formData.columns.length === 0 && (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#94a3b8",
                      border: "2px dashed #e2e8f0",
                      borderRadius: "8px",
                      background: "#f8fafc",
                    }}
                  >
                    <svg
                      style={{ margin: "0 auto 12px", display: "block" }}
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                    </svg>
                    <p style={{ margin: 0, fontSize: "14px" }}>
                      Klik "Tambah Kolom" untuk menambahkan field
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(79, 70, 229, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(79, 70, 229, 0.25)";
                  }}
                >
                  {editingTable ? "Update Tabel" : "Buat Tabel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    setFormData({
                      table_name: "",
                      display_name: "",
                      id_field_name: "",
                      table_relations: [],
                      columns: [],
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f1f5f9";
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicMasterManagement;
