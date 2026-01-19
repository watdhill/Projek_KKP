import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/master-data";

// Tab configuration matching backend
const TABS = [
  { key: "frekuensi_pemakaian", label: "Frekuensi Pemakaian" },
  { key: "format_laporan", label: "Format Laporan" },
  { key: "eselon1", label: "Eselon 1" },
  { key: "eselon2", label: "Eselon 2" },
  { key: "status_aplikasi", label: "Status Aplikasi" },
  { key: "environment", label: "Environment" },
  { key: "cara_akses", label: "Cara Akses" },
  { key: "pdn", label: "PDN" },
];

// Form field configurations per type
const FORM_FIELDS = {
  eselon1: [
    {
      name: "nama_eselon1",
      label: "Eselon I",
      type: "text",
      placeholder: "Nama Eselon",
      required: true,
    },
    {
      name: "singkatan",
      label: "Singkatan",
      type: "text",
      placeholder: "Tulis Singkatan Eselon",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  eselon2: [
    {
      name: "eselon1_id",
      label: "Eselon 1",
      type: "select",
      required: true,
      options: [],
    }, // populated dynamically
    {
      name: "nama_eselon2",
      label: "Nama Eselon 2",
      type: "text",
      placeholder: "Nama Eselon 2",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  frekuensi_pemakaian: [
    {
      name: "nama_frekuensi",
      label: "Nama Frekuensi",
      type: "text",
      placeholder: "Nama Frekuensi",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  status_aplikasi: [
    {
      name: "nama_status",
      label: "Nama Status",
      type: "text",
      placeholder: "Nama Status Aplikasi",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  environment: [
    {
      name: "jenis_environment",
      label: "Jenis Environment",
      type: "text",
      placeholder: "Jenis Environment",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  cara_akses: [
    {
      name: "nama_cara_akses",
      label: "Nama Cara Akses",
      type: "text",
      placeholder: "Nama Cara Akses",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  pdn: [
    {
      name: "kode_pdn",
      label: "Kode PDN",
      type: "text",
      placeholder: "Kode PDN",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  format_laporan: [
    {
      name: "nama_format",
      label: "Nama Format",
      type: "text",
      placeholder: "Nama Format Laporan",
      required: true,
    },
    {
      name: "status_aktif",
      label: "Status Aktif",
      type: "select",
      required: true,
      options: [
        { value: 1, label: "True" },
        { value: 0, label: "False" },
      ],
    },
  ],
};

// Table column configurations per type
const TABLE_COLUMNS = {
  eselon1: ["nama_eselon1", "singkatan", "status_aktif"],
  eselon2: ["nama_eselon2", "status_aktif"],
  frekuensi_pemakaian: ["nama_frekuensi", "status_aktif"],
  status_aplikasi: ["nama_status", "status_aktif"],
  environment: ["jenis_environment", "status_aktif"],
  cara_akses: ["nama_cara_akses", "status_aktif"],
  pdn: ["kode_pdn", "status_aktif"],
  format_laporan: ["nama_format", "status_aktif"],
};

// ID field per type
// NOTE: pastikan ini sesuai output backend. Kalau backend masih ngirim "id", aktifkan fallback di getRowId().
const ID_FIELDS = {
  eselon1: "eselon1_id",
  eselon2: "eselon2_id",
  frekuensi_pemakaian: "frekuensi_pemakaian", // kalau di backend kamu *_id, ubah ya
  status_aplikasi: "status_aplikasi_id",
  environment: "environment_id",
  cara_akses: "cara_akses_id",
  pdn: "pdn_id",
  format_laporan: "format_laporan_id",
};

// Data field options for Format Laporan picker
// FIX typo: status_aplikasi_id, environment_id
const DATA_FIELD_OPTIONS = [
  { value: "nama_aplikasi", label: "Nama Aplikasi" },
  { value: "eselon1_id", label: "Eselon 1" },
  { value: "eselon2_id", label: "Eselon 2" },
  { value: "cara_akses_id", label: "Cara Akses" },
  { value: "frekuensi_update_id", label: "Frekuensi Update" },
  { value: "status_aplikasi_id", label: "Status Aplikasi" },
  { value: "pdn_id", label: "PDN" },
  { value: "environment_id", label: "Environment" },
  { value: "pic_internal_id", label: "PIC Internal" },
  { value: "pic_eksternal_id", label: "PIC Eksternal" },
  { value: "domain", label: "Domain" },
  { value: "deskripsi_fungsi", label: "Deskripsi Fungsi" },
  { value: "user_pengguna", label: "User Pengguna" },
  { value: "data_digunakan", label: "Data Digunakan" },
  { value: "luaran_output", label: "Luaran/Output" },
  { value: "server_aplikasi", label: "Server Aplikasi" },
  { value: "tipe_lisensi_bahasa", label: "Tipe Lisensi Bahasa" },
  { value: "bahasa_pemrograman", label: "Bahasa Pemrograman" },
  { value: "basis_data", label: "Basis Data" },
  { value: "kerangka_pengembangan", label: "Kerangka Pengembangan" },
  { value: "unit_pengembang", label: "Unit Pengembang" },
  { value: "unit_operasional_teknologi", label: "Unit Operasional Teknologi" },
  {
    value: "nilai_pengembangan_aplikasi",
    label: "Nilai Pengembangan Aplikasi",
  },
  { value: "pusat_komputasi_utama", label: "Pusat Komputasi Utama" },
  { value: "pusat_komputasi_backup", label: "Pusat Komputasi Backup" },
  { value: "mandiri_komputasi_backup", label: "Mandiri Komputasi Backup" },
  { value: "perangkat_lunak", label: "Perangkat Lunak" },
  { value: "cloud", label: "Cloud" },
  { value: "waf", label: "WAF" },
  { value: "antivirus", label: "Antivirus" },
  { value: "va_pt_status", label: "VA/PT Status" },
  { value: "va_pt_waktu", label: "VA/PT Waktu" },
  { value: "alamat_ip_publik", label: "Alamat IP Publik" },
  { value: "keterangan", label: "Keterangan" },
  { value: "status_bmn", label: "Status BMN" },
  { value: "api_internal_status", label: "API Internal Status" },
];

function MasterDataSection() {
  const [activeTab, setActiveTab] = useState("eselon1");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [eselon1Options, setEselon1Options] = useState([]);

  // State for Format Laporan picker
  const [selectedDataFields, setSelectedDataFields] = useState([]);
  const [availableDataFields, setAvailableDataFields] = useState([
    ...DATA_FIELD_OPTIONS,
  ]);

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
    return item?.[key] ?? item?.id; // fallback kalau backend masih kirim "id"
  };

  // selected_fields dari DB bisa berupa:
  // - array
  // - string JSON '["a","b"]'
  // - string 'a,b' (tergantung backend lama)
  const normalizeSelectedFields = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      // coba JSON dulu
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // kalau bukan JSON, coba split koma
        if (trimmed.includes(",")) {
          return trimmed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }
    return [];
  };

  const setupFormatPicker = (selectedKeys = []) => {
    const setKeys = new Set(selectedKeys);
    const selected = DATA_FIELD_OPTIONS.filter((o) => setKeys.has(o.value));
    const available = DATA_FIELD_OPTIONS.filter((o) => !setKeys.has(o.value));

    setSelectedDataFields(selected);
    setAvailableDataFields(available);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setupFormatPicker([]);
  };

  // ---------- Fetch ----------
  useEffect(() => {
    fetchData();
    if (activeTab === "eselon2") fetchEselon1Options();
    // reset picker ketika pindah tab format_laporan
    if (activeTab === "format_laporan") setupFormatPicker([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}?type=${activeTab}`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fetchEselon1Options = async () => {
    try {
      const response = await fetch(`${API_BASE}?type=eselon1`);
      if (!response.ok) return;

      const result = await response.json();
      const opts = (result.data || [])
        .filter((item) => item.status_aktif === 1)
        .map((item) => ({ value: item.eselon1_id, label: item.nama_eselon1 }));

      setEselon1Options(opts);
    } catch (err) {
      console.error("Failed to fetch Eselon 1 options:", err);
    }
  };

  // ---------- Actions ----------
  const handleAdd = () => {
    setEditingItem(null);

    const initialData = {};
    (FORM_FIELDS[activeTab] || []).forEach((field) => {
      if (field.name === "eselon1_id") {
        initialData[field.name] = eselon1Options.length
          ? eselon1Options[0].value
          : "";
      } else if (field.type === "select" && field.options?.length) {
        initialData[field.name] = field.options[0].value;
      } else {
        initialData[field.name] = "";
      }
    });

    // default status_aktif
    if (initialData.status_aktif === undefined) initialData.status_aktif = 1;

    setFormData(initialData);

    if (activeTab === "format_laporan") {
      setupFormatPicker([]);
    }

    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    FORM_FIELDS[activeTab]?.forEach((field) => {
      // Handle special case for selected_fields which might not be in FORM_FIELDS config directly
      editData[field.name] = item[field.name] ?? "";
    });

    // default status_aktif
    if (editData.status_aktif === undefined) editData.status_aktif = 1;
    setFormData(editData);

    // Handle Format Laporan state loading
    if (activeTab === "format_laporan") {
      let selectedValues = [];
      try {
        if (item.selected_fields) {
          selectedValues =
            typeof item.selected_fields === "string"
              ? JSON.parse(item.selected_fields)
              : item.selected_fields;

          if (!Array.isArray(selectedValues)) selectedValues = [];
        }
      } catch (e) {
        console.error("Failed to parse selected_fields:", e);
        selectedValues = [];
      }

      const selectedItems = DATA_FIELD_OPTIONS.filter((opt) =>
        selectedValues.includes(opt.value)
      );
      setSelectedDataFields(selectedItems);

      const availableItems = DATA_FIELD_OPTIONS.filter(
        (opt) => !selectedValues.includes(opt.value)
      );
      setAvailableDataFields(availableItems);
    }

    setShowModal(true);
  };

  // Picker
  const addDataField = (field) => {
    setSelectedDataFields((prev) => [...prev, field]);
    setAvailableDataFields((prev) =>
      prev.filter((f) => f.value !== field.value)
    );
  };

  const removeDataField = (field) => {
    setSelectedDataFields((prev) =>
      prev.filter((f) => f.value !== field.value)
    );
    setAvailableDataFields((prev) => [...prev, field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      const fields = FORM_FIELDS[activeTab] || [];
      for (const field of fields) {
        if (!field.required) continue;

        const val = formData[field.name];

        if (field.type === "select") {
          if (val === "" || val === null || val === undefined) {
            throw new Error(`Field "${field.label}" wajib dipilih`);
          }
        } else {
          if (!val || val.toString().trim() === "") {
            throw new Error(`Field "${field.label}" tidak boleh kosong`);
          }
        }
      }

      // Format Laporan must select at least one
      if (activeTab === "format_laporan" && selectedDataFields.length === 0) {
        throw new Error("Silakan pilih minimal satu data untuk format laporan");
      }

      const idField = ID_FIELDS[activeTab];
      const editId = editingItem?.[idField] ?? editingItem?.id;

      const url = editingItem
        ? `${API_BASE}/${editId}?type=${activeTab}`
        : `${API_BASE}?type=${activeTab}`;

      const method = editingItem ? "PUT" : "POST";

      const processedData = { ...formData };

      // Normalize ints
      if (
        processedData.eselon1_id !== undefined &&
        processedData.eselon1_id !== ""
      ) {
        processedData.eselon1_id = parseInt(processedData.eselon1_id, 10);
      }
      if (
        processedData.status_aktif !== undefined &&
        processedData.status_aktif !== ""
      ) {
        processedData.status_aktif = parseInt(processedData.status_aktif, 10);
      }

      // PENTING: simpan selected_fields sebagai STRING JSON (karena kolom DB kamu longtext)
      if (activeTab === "format_laporan") {
        const keys = selectedDataFields.map((f) => f.value);
        processedData.selected_fields = JSON.stringify(keys);
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal menyimpan data");

      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleToggleStatus = async (item, newStatus) => {
    try {
      const idField = ID_FIELDS[activeTab];
      const rowId = item?.[idField] ?? item?.id;

      const response = await fetch(
        `${API_BASE}/${rowId}/status?type=${activeTab}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_aktif: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Gagal mengubah status");
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
    <section id="master-data" className="page-section">
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              borderRadius: "12px",
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
                fontSize: "28px",
                fontWeight: 700,
                color: "#1e293b",
                letterSpacing: "-0.02em",
              }}
            >
              Master Data
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                marginTop: "2px",
              }}
            >
              Kelola data referensi sistem
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "8px",
          marginBottom: "20px",
          padding: "8px",
          backgroundColor: "#f8fafc",
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
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                activeTab === tab.key ? "#4f46e5" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "#64748b",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: 600,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                activeTab === tab.key
                  ? "0 2px 8px rgba(79, 70, 229, 0.25)"
                  : "none",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.color = "#1e293b";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#64748b";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div style={{ position: "relative", maxWidth: "320px" }}>
          <svg
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 42px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
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

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            color: "#991b1b",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#991b1b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {/* Table Header with Add Button */}
      {!loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              Daftar {TABS.find((t) => t.key === activeTab)?.label}
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Total: {filteredData.length} data
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: "11px 24px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.25)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Data
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 32px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #e2e8f0",
                borderTopColor: "#4f46e5",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            ></div>
            <span
              style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}
            >
              Memuat data...
            </span>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div
          style={{
            padding: "60px 40px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            Belum ada data
          </p>
          <p
            style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#94a3b8" }}
          >
            Klik tombol "Tambah Data" untuk memulai
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
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
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 700,
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
                    fontWeight: 700,
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
                  key={getRowId(item) ?? index}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    transition: "all 0.2s",
                    height: "50px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                    e.currentTarget.style.transform = "scale(1.001)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#fafbfc";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {columns.map((col) => {
                    if (col === "status_aktif") {
                      const statusColor = getStatusColor(item[col]);
                      return (
                        <td
                          key={col}
                          style={{
                            padding: "10px 14px",
                            verticalAlign: "middle",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "5px 12px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                            }}
                          >
                            <div
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                backgroundColor: statusColor.text,
                              }}
                            ></div>
                            {statusColor.label}
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
                          fontWeight: 500,
                          verticalAlign: "middle",
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
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: "6px 14px",
                          background:
                            "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 6px rgba(245, 158, 11, 0.25)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 10px rgba(245, 158, 11, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 6px rgba(245, 158, 11, 0.25)";
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                    </div>
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
            backgroundColor: "rgba(15, 23, 42, 0.6)",
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
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
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
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {editingItem ? (
                      <>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </>
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
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
                  }}
                >
                  {editingItem ? "Edit Data" : "Tambah Data Baru"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === "format_laporan" ? (
                <div>
                  {/* Nama Format */}
                  <div style={{ marginBottom: "18px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Nama Format <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama format laporan"
                      value={formData.nama_format ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nama_format: e.target.value,
                        })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
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

                  {/* Picker Split View */}
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Available */}
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Daftar Data
                      </label>
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          height: "260px",
                          overflowY: "auto",
                          backgroundColor: "#f8fafc",
                          padding: "10px",
                        }}
                      >
                        {availableDataFields.map((field) => (
                          <div
                            key={field.value}
                            onClick={() => addDataField(field)}
                            style={{
                              padding: "10px 12px",
                              marginBottom: "6px",
                              backgroundColor: "#ffffff",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#334155",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f0f9ff";
                              e.target.style.borderColor = "#4f46e5";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#ffffff";
                              e.target.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>
                              {field.label}
                            </span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected */}
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Data Dipilih <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          height: "260px",
                          overflowY: "auto",
                          backgroundColor: "#ffffff",
                          padding: "10px",
                        }}
                      >
                        {selectedDataFields.length === 0 ? (
                          <div
                            style={{
                              padding: "40px 20px",
                              textAlign: "center",
                              color: "#94a3b8",
                              fontSize: "13px",
                            }}
                          >
                            <svg
                              style={{ margin: "0 auto 8px", display: "block" }}
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#cbd5e1"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            Pilih data dari daftar
                          </div>
                        ) : (
                          selectedDataFields.map((field) => (
                            <div
                              key={field.value}
                              onClick={() => removeDataField(field)}
                              style={{
                                padding: "10px 12px",
                                marginBottom: "6px",
                                background:
                                  "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                                borderRadius: "8px",
                                border: "1px solid #93c5fd",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#1e40af",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#fee2e2";
                                e.target.style.borderColor = "#fca5a5";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background =
                                  "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)";
                                e.target.style.borderColor = "#93c5fd";
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {field.label}
                              </span>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Aktif */}
                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Status Aktif <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={formData.status_aktif ?? 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status_aktif: e.target.value,
                        })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
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
                    >
                      <option value={1}>True</option>
                      <option value={0}>False</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Standard Dynamic Form
                (FORM_FIELDS[activeTab] || []).map((field) => {
                  let options = field.options || [];
                  if (field.name === "eselon1_id") options = eselon1Options;

                  return (
                    <div key={field.name} style={{ marginBottom: "18px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {field.label}{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
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
                            padding: "11px 14px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                            backgroundColor: "#ffffff",
                            cursor: "pointer",
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
                        >
                          {options.length === 0 ? (
                            <option value="">-- belum ada pilihan --</option>
                          ) : (
                            options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
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
                            padding: "11px 14px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
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
                      )}
                    </div>
                  );
                })
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "13px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
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
                  {editingItem ? "Perbarui Data" : "Simpan Data"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "13px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9";
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MasterDataSection;
