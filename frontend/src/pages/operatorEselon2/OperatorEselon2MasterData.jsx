import { useState, useEffect } from "react";

// Konfigurasi Tabs
const TABS = [
  { key: "pic_internal", label: "PIC Internal" },
  { key: "pic_eksternal", label: "PIC Eksternal" },
];

const API_BASE = "http://localhost:5000/api/master-data";

const ID_FIELDS = {
  pic_internal: "pic_internal_id",
  pic_eksternal: "pic_eksternal_id",
};

const TABLE_COLUMNS = {
  pic_internal: ["nama_pic_internal", "email_pic", "kontak_pic_internal", "status_aktif"],
  pic_eksternal: [
    "nama_pic_eksternal",
    "keterangan",
    "email_pic",
    "kontak_pic_eksternal",
    "status_aktif",
  ],
};

const FORM_FIELDS = {
  pic_internal: [
    {
      name: "nama_pic_internal",
      label: "Nama PIC Internal",
      type: "text",
      placeholder: "Nama PIC Internal",
      required: true,
    },
    {
      name: "email_pic",
      label: "Email",
      type: "email",
      placeholder: "Contoh: pic@mail.com",
      required: true,
    },
    {
      name: "kontak_pic_internal",
      label: "Nomor HP",
      type: "text",
      placeholder: "Contoh: 08123456789",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
      required: true,
    },
  ],
  pic_eksternal: [
    {
      name: "nama_pic_eksternal",
      label: "Nama PIC Eksternal",
      type: "text",
      placeholder: "Nama PIC Eksternal",
      required: true,
    },
    {
      name: "keterangan",
      label: "Instansi",
      type: "text",
      placeholder: "Nama Instansi",
      required: true,
    },
    {
      name: "email_pic",
      label: "Email",
      type: "email",
      placeholder: "Contoh: pic@mail.com",
      required: true,
    },
    {
      name: "kontak_pic_eksternal",
      label: "Nomor HP",
      type: "text",
      placeholder: "Contoh: 08123456789",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
      required: true,
    },
  ],
};

function OperatorEselon2MasterData() {
  const [activeTab, setActiveTab] = useState("pic_internal");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [eselon2Options, setEselon2Options] = useState([]);

  // ---------- Helpers ----------
  const formatColumnHeader = (col) =>
    col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusColor = (status) => {
    if (status === 1 || status === true || status === "Aktif") {
      return { bg: "#dcfce7", text: "#166534", label: "Aktif" };
    }
    return { bg: "#fee2e2", text: "#991b1b", label: "Nonaktif" };
  };

  const getRowId = (item) => {
    const key = ID_FIELDS[activeTab];
    return item?.[key] ?? item?.id;
  };

  // ---------- Fetch ----------
  useEffect(() => {
    fetchData();
    fetchEselon2Options();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getUserEselon2Id = () => {
    // Try direct item first
    const directId = localStorage.getItem("eselon2_id");
    if (directId) return directId;

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.eselon2_id;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const eselon2Id = getUserEselon2Id();
      let url = `${API_BASE}?type=${activeTab}`;

      // Filter by eselon2_id for Operator Eselon 2
      if (eselon2Id) {
        url += `&eselon2_id=${eselon2Id}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data");
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fetchEselon2Options = async () => {
    try {
      const response = await fetch(`${API_BASE}?type=eselon2`);
      if (!response.ok) return;

      const result = await response.json();
      const opts = (result.data || [])
        .filter((item) => item.status_aktif === 1)
        .map((item) => ({ value: item.eselon2_id, label: item.nama_eselon2 }));

      setEselon2Options(opts);
    } catch (err) {
      console.error("Failed to fetch Eselon 2 options:", err);
    }
  };

  // ---------- Actions ----------
  const handleAdd = () => {
    setEditingItem(null);
    const initialData = {};
    const userEselon2Id = getUserEselon2Id();

    (FORM_FIELDS[activeTab] || []).forEach((field) => {
      // Initialize Selects
      if (field.name === "eselon2_id") {
        // Auto-assign from logged in user
        initialData[field.name] = userEselon2Id || "";
      } else if (field.type === "select" && field.options?.length) {
        initialData[field.name] = field.options[0].value;
      } else {
        initialData[field.name] = "";
      }
    });

    // default status_aktif
    if (initialData.status_aktif === undefined) initialData.status_aktif = 1;

    setFormData(initialData);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    FORM_FIELDS[activeTab]?.forEach((field) => {
      editData[field.name] = item[field.name] ?? "";
    });

    // Ensure eselon2_id is preserved or re-assigned
    if (!editData.eselon2_id) {
      const userEselon2Id = getUserEselon2Id();
      editData.eselon2_id = userEselon2Id;
    }

    if (editData.status_aktif === undefined) editData.status_aktif = 1;
    setFormData(editData);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Client-side validation
      const fields = FORM_FIELDS[activeTab] || [];
      for (const field of fields) {
        if (field.required) {
          const val = formData[field.name];
          if (
            val === undefined ||
            val === null ||
            val.toString().trim() === ""
          ) {
            throw new Error(`Field "${field.label}" wajib diisi`);
          }
        }
      }
      setShowConfirm(true);
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleConfirmSave = async () => {
    try {
      const idField = ID_FIELDS[activeTab];
      const editId = editingItem?.[idField] ?? editingItem?.id;
      const url = editingItem
        ? `${API_BASE}/${editId}?type=${activeTab}`
        : `${API_BASE}?type=${activeTab}`;
      const method = editingItem ? "PUT" : "POST";

      const processedData = { ...formData };

      // Ensure eselon2_id is set
      const userEselon2Id = getUserEselon2Id();
      if (!processedData.eselon2_id && userEselon2Id) {
        processedData.eselon2_id = userEselon2Id;
      }

      // Normalize ints
      if (processedData.eselon2_id)
        processedData.eselon2_id = parseInt(processedData.eselon2_id, 10);
      if (processedData.status_aktif !== undefined)
        processedData.status_aktif = parseInt(processedData.status_aktif, 10);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal menyimpan data");

      setShowConfirm(false);
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // ---------- Derived ----------
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = TABLE_COLUMNS[activeTab] || [];

  return (
    <section className="page-section">
      {/* Header */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#1e293b",
              letterSpacing: "-0.025em",
            }}
          >
            Master Data (PIC)
          </h1>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13.5px",
              fontWeight: 400,
            }}
          >
            Kelola data PIC Internal dan Eksternal
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "8px",
          marginBottom: "22px",
          backgroundColor: "#f8fafc",
          padding: "6px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "9px 14px",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                activeTab === tab.key ? "#ffffff" : "transparent",
              color: activeTab === tab.key ? "#4f46e5" : "#64748b",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: activeTab === tab.key ? 600 : 500,
              transition: "all 0.2s ease",
              boxShadow:
                activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              textTransform: "capitalize",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ position: "relative", maxWidth: "320px" }}>
          <svg
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 38px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
              backgroundColor: "#ffffff",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4f46e5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            marginBottom: "16px",
            borderRadius: "6px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "32px",
              height: "32px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          ></div>
          <div style={{ marginTop: "12px" }}>Memuat data...</div>
        </div>
      ) : filteredData.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            color: "#94a3b8",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
          <div style={{ fontWeight: 500 }}>Belum ada data</div>
          <div style={{ fontSize: "12px", marginTop: "4px", marginBottom: "16px" }}>
            Klik tombol "Tambah Data" untuk menambahkan data baru
          </div>
          <button
            onClick={handleAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Data
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Table Header Section */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: "#fafbfc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}
              >
                {TABS.find((t) => t.key === activeTab)?.label || "Data"}
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                Total: {filteredData.length} data
              </div>
            </div>
            <button
              onClick={handleAdd}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(79, 70, 229, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.2)";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Data
            </button>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {formatColumnHeader(col)}
                  </th>
                ))}
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "11.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={getRowId(item) || index}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    transition: "all 0.15s ease",
                    height: "50px",
                  }}
                >
                  {columns.map((col) => {
                    if (col === "status_aktif") {
                      const st = getStatusColor(item[col]);
                      return (
                        <td
                          key={col}
                          style={{ padding: "10px 14px", fontSize: "13px" }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "5px 12px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: st.bg,
                              color: st.text,
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                            }}
                          >
                            <span
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                backgroundColor: st.text,
                                display: "inline-block",
                              }}
                            />
                            {st.label}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={col}
                        style={{
                          padding: "10px 14px",
                          color: "#1e293b",
                          fontSize: "13px",
                        }}
                      >
                        {item[col] || "-"}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: "6px 14px",
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 1px 3px rgba(245, 158, 11, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 2px 6px rgba(245, 158, 11, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 1px 3px rgba(245, 158, 11, 0.2)";
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
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
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)",
              transform: "scale(1)",
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
                  borderRadius: "10px",
                  background: editingItem
                    ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: editingItem
                    ? "0 4px 12px rgba(245, 158, 11, 0.25)"
                    : "0 4px 12px rgba(79, 70, 229, 0.25)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {editingItem ? (
                    <>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </>
                  ) : (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </>
                  )}
                </svg>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1e293b",
                  letterSpacing: "-0.025em",
                }}
              >
                {editingItem ? "Edit Data" : "Tambah Data"}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              {(FORM_FIELDS[activeTab] || []).map((field) => {
                // Skip rendering eselon2_id as it is auto-assigned
                if (field.name === "eselon2_id") return null;

                let options = field.options || [];
                if (field.name === "eselon2_id") options = eselon2Options;

                return (
                  <div key={field.name} style={{ marginBottom: "18px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {field.label}{" "}
                      <span style={{ color: "#ef4444", fontWeight: 700 }}>
                        *
                      </span>
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={formData[field.name] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
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
                      >
                        {options.length === 0 ? (
                          <option value="">-- Kosong --</option>
                        ) : (
                          options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))
                        )}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          backgroundColor: "#ffffff",
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
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 8px rgba(79, 70, 229, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 4px rgba(79, 70, 229, 0.2)";
                  }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    backgroundColor: "#f1f5f9",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e2e8f0";
                    e.target.style.color = "#475569";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9";
                    e.target.style.color = "#64748b";
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Konfirmasi
            </h3>
            <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: "15px", lineHeight: "1.5" }}>
              {editingItem
                ? "Apakah anda yakin ingin memperbarui data?"
                : "Apakah data yang diisi sudah benar?"}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleConfirmSave}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#4f46e5",
                  color: "#white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4338ca")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#4f46e5")}
              >
                Ya
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#e2e8f0")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#f1f5f9")}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OperatorEselon2MasterData;
