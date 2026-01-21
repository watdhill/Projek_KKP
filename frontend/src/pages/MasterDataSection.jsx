import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/master-data";

// Tab configuration matching backend (static tabs)
const STATIC_TABS = [
  { key: "frekuensi_pemakaian", label: "Frekuensi Pemakaian" },
  { key: "format_laporan", label: "Format Laporan" },
  { key: "eselon1", label: "Eselon 1" },
  { key: "eselon2", label: "Eselon 2" },
  { key: "upt", label: "UPT" },
  { key: "status_aplikasi", label: "Status Aplikasi" },
  { key: "environment", label: "Ekosistem" },
  { key: "cara_akses", label: "Cara Akses" },
  { key: "pdn", label: "PDN" },
];

// Form field configurations per type
const FORM_FIELDS = {
  eselon1: [
    {
      name: "no",
      label: "No Urutan",
      type: "number",
      placeholder: "Nomor urutan",
      required: true,
    },
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
      name: "no_urutan",
      label: "No Urutan",
      type: "number",
      placeholder: "Nomor urutan",
      required: true,
    },
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
  upt: [
    {
      name: "no_urutan",
      label: "No Urutan",
      type: "number",
      placeholder: "Nomor urutan",
      required: true,
    },
    {
      name: "eselon1_id",
      label: "Eselon 1",
      type: "select",
      required: true,
      options: [],
    }, // populated dynamically
    {
      name: "nama_upt",
      label: "Nama UPT",
      type: "text",
      placeholder: "Nama UPT",
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
      label: "Jenis Ekosistem",
      type: "text",
      placeholder: "Jenis Ekosistem",
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
  eselon1: ["no", "nama_eselon1", "singkatan", "status_aktif"],
  eselon2: ["no_urutan", "nama_eselon2", "status_aktif"],
  upt: ["no_urutan", "nama_upt", "status_aktif"],
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
  upt: "upt_id",
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

function TreeNode({ node, selectedIds, onToggle, searchTerm }) {
  const [isOpen, setIsOpen] = useState(node.level === 1); // Expand Level 1 by default

  useEffect(() => {
    if (searchTerm) setIsOpen(true);
  }, [searchTerm]);

  const hasChildren = node.children && node.children.length > 0;

  // Filter children based on search term
  const filteredChildren = node.children?.filter((child) => {
    if (!searchTerm) return true;
    const matchesSelf = child.nama_field
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const hasMatchingDescendant = (n) => {
      if (!n.children) return false;
      return n.children.some(
        (c) =>
          c.nama_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hasMatchingDescendant(c),
      );
    };
    return matchesSelf || hasMatchingDescendant(child);
  });

  // Get all leaf (Level 3) descendant IDs
  const getLeafDescendants = (n) => {
    if (!n.children || n.children.length === 0) return [n.field_id];
    let ids = [];
    n.children.forEach((child) => {
      ids = [...ids, ...getLeafDescendants(child)];
    });
    return ids;
  };

  const leafDescendants = getLeafDescendants(node);
  const isFullySelected = leafDescendants.every((id) =>
    selectedIds.includes(id),
  );
  const isPartiallySelected =
    !isFullySelected && leafDescendants.some((id) => selectedIds.includes(id));

  // Determine text color based on level
  let textColor = "#475569"; // default (Level 3)
  if (node.level === 1)
    textColor = "#ef4444"; // Red
  else if (node.level === 2) textColor = "#3b82f6"; // Blue

  // If searching and this node doesn't match and has no matching children, hide it
  const isMatch = node.nama_field
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
  const hasMatchingDescendant = (n) => {
    if (!n.children) return false;
    return n.children.some(
      (c) =>
        c.nama_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hasMatchingDescendant(c),
    );
  };

  if (searchTerm && !isMatch && !hasMatchingDescendant(node)) {
    return null;
  }

  return (
    <div style={{ marginLeft: node.level === 1 ? 0 : "18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 6px",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f1f5f9")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#64748b",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                transform: isOpen ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        ) : (
          <div
            style={{
              width: "14px",
              display: "flex",
              justifyContent: "center",
              fontSize: "10px",
              color: "#94a3b8",
            }}
          >
            o
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
          }}
          onClick={() => onToggle(node)}
        >
          <input
            type="checkbox"
            checked={isFullySelected}
            ref={(el) => el && (el.indeterminate = isPartiallySelected)}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(node);
            }}
            style={{
              cursor: "pointer",
              width: "15px",
              height: "15px",
              accentColor:
                node.level === 1
                  ? "#ef4444"
                  : node.level === 2
                    ? "#3b82f6"
                    : "#4f46e5",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: hasChildren ? 700 : 500,
              color: textColor,
              userSelect: "none",
            }}
          >
            {node.nama_field}
          </span>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div
          style={{
            borderLeft: "1px dashed #e2e8f0",
            marginLeft: "6px",
            paddingLeft: "4px",
          }}
        >
          {filteredChildren.map((child) => (
            <TreeNode
              key={child.field_id}
              node={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MasterDataSection() {
  const [tabs, setTabs] = useState(STATIC_TABS); // Dynamic tabs
  const [activeTab, setActiveTab] = useState("eselon1");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [eselon1Options, setEselon1Options] = useState([]);
  const [dynamicFormFields, setDynamicFormFields] = useState([]); // Dynamic table columns

  // State for Format Laporan picker
  const [selectedDataFields, setSelectedDataFields] = useState([]);
  const [availableDataFields, setAvailableDataFields] = useState([
    ...DATA_FIELD_OPTIONS,
  ]);
  const [hierarchicalFields, setHierarchicalFields] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [hierSearchTerm, setHierSearchTerm] = useState("");

  // Load dynamic tables on mount
  useEffect(() => {
    fetchDynamicTables();
  }, []);

  const fetchDynamicTables = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/dynamic-master/available-types",
      );
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const dynamicTabs = result.data.map((table) => ({
          key: table.key,
          label: table.label,
          isDynamic: true,
        }));
        setTabs([...STATIC_TABS, ...dynamicTabs]);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic tables:", err);
    }
  };

  // ---------- Helpers ----------
  const formatColumnHeader = (col) =>
    col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusColor = (status) => {
    if (status === 1 || status === true || status === "Aktif") {
      return { bg: "#dcfce7", text: "#166534", label: "Aktif" };
    }
    return { bg: "#fee2e2", text: "#991b1b", label: "Nonaktif" };
  };

  const getIdField = (tabKey) => {
    // Check static tables first
    if (ID_FIELDS[tabKey]) {
      return ID_FIELDS[tabKey];
    }
    // For dynamic tables, find from tabs state
    const dynamicTab = tabs.find((t) => t.key === tabKey && t.isDynamic);
    if (dynamicTab) {
      // Try to get from backend data
      const tableData = data[0];
      if (tableData) {
        // Find the ID column (usually ends with _id)
        const possibleIdField = Object.keys(tableData).find(
          (key) => key.endsWith("_id") && tableData[key] !== undefined,
        );
        if (possibleIdField) return possibleIdField;
      }
    }
    return "id"; // fallback
  };

  const getRowId = (item) => {
    const key = getIdField(activeTab);
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
    setSelectedFieldIds([]);
    setHierSearchTerm("");
  };

  // ---------- Fetch ----------
  useEffect(() => {
    fetchData();

    // Check if dynamic tab
    const isDynamic = tabs.find((t) => t.key === activeTab)?.isDynamic;
    if (isDynamic) {
      fetchDynamicTableColumns();
    }

    if (activeTab === "eselon2" || activeTab === "upt") fetchEselon1Options();
    // reset picker ketika pindah tab format_laporan
    if (activeTab === "format_laporan") {
      setupFormatPicker([]);
      fetchHierarchicalFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchDynamicTableColumns = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/dynamic-master/tables`,
      );
      if (!response.ok) return;
      const result = await response.json();

      // Find columns for current table
      const tableInfo = result.data.find((t) => t.table_name === activeTab);
      if (tableInfo && tableInfo.table_schema) {
        const schema =
          typeof tableInfo.table_schema === "string"
            ? JSON.parse(tableInfo.table_schema)
            : tableInfo.table_schema;

        const fields = schema.map((col) => ({
          name: col.column_name,
          label: col.display_name,
          type: getInputType(col.column_type),
          required: !col.is_nullable,
          placeholder: col.display_name,
        }));

        // Tambahkan field status_aktif otomatis
        fields.push({
          name: "status_aktif",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: 1, label: "Aktif" },
            { value: 0, label: "Tidak Aktif" },
          ],
        });

        setDynamicFormFields(fields);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic table columns:", err);
    }
  };

  const getInputType = (columnType) => {
    const typeMap = {
      VARCHAR: "text",
      TEXT: "text",
      INT: "number",
      BIGINT: "number",
      DECIMAL: "number",
      DATE: "date",
      BOOLEAN: "select",
    };
    return typeMap[columnType] || "text";
  };

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

  const fetchHierarchicalFields = async () => {
    try {
      const response = await fetch(`${API_BASE}/laporan-fields`);
      if (!response.ok) return;
      const result = await response.json();
      setHierarchicalFields(result.data || []);
    } catch (err) {
      console.error("Failed to fetch hierarchical fields:", err);
    }
  };

  // ---------- Actions ----------
  const handleAdd = () => {
    setEditingItem(null);

    const initialData = {};
    const isDynamic = tabs.find((t) => t.key === activeTab)?.isDynamic;
    const fields = isDynamic ? dynamicFormFields : FORM_FIELDS[activeTab] || [];

    fields.forEach((field) => {
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
      setSelectedFieldIds([]);
    }

    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    const isDynamic = tabs.find((t) => t.key === activeTab)?.isDynamic;
    const fields = isDynamic ? dynamicFormFields : FORM_FIELDS[activeTab] || [];

    fields.forEach((field) => {
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
        selectedValues.includes(opt.value),
      );
      setSelectedDataFields(selectedItems);

      const availableItems = DATA_FIELD_OPTIONS.filter(
        (opt) => !selectedValues.includes(opt.value),
      );
      setAvailableDataFields(availableItems);

      // Handle hierarchical fields from extra API data if available
      // Fetch details for the specific item
      fetch(`${API_BASE}/${getRowId(item)}?type=format_laporan`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data.field_ids) {
            setSelectedFieldIds(result.data.field_ids);
          }
        })
        .catch((err) => console.error("Error fetching format details:", err));
    }

    setShowModal(true);
  };

  // Picker
  const addDataField = (field) => {
    setSelectedDataFields((prev) => [...prev, field]);
    setAvailableDataFields((prev) =>
      prev.filter((f) => f.value !== field.value),
    );
  };

  const removeDataField = (field) => {
    setSelectedDataFields((prev) =>
      prev.filter((f) => f.value !== field.value),
    );
    setAvailableDataFields((prev) => [...prev, field]);
  };

  const toggleHierarchicalField = (node) => {
    const getTargetLeafIds = (n) => {
      if (!n.children || n.children.length === 0) return [n.field_id];
      let ids = [];
      n.children.forEach((child) => {
        ids = [...ids, ...getTargetLeafIds(child)];
      });
      return ids;
    };

    const targetIds = getTargetLeafIds(node);
    const allSelected = targetIds.every((id) => selectedFieldIds.includes(id));

    if (allSelected) {
      // Unselect all leaf descendants
      setSelectedFieldIds((prev) =>
        prev.filter((id) => !targetIds.includes(id)),
      );
    } else {
      // Select all leaf descendants
      setSelectedFieldIds((prev) => {
        const newIds = [...prev];
        targetIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  const findFieldNameById = (id, nodes) => {
    for (const node of nodes) {
      if (node.field_id === id) return node.nama_field;
      if (node.children) {
        const found = findFieldNameById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const findNodeById = (id, nodes) => {
    for (const node of nodes) {
      if (node.field_id === id) return node;
      if (node.children) {
        const found = findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Get all leaf node IDs from the hierarchical fields
  const getAllLeafIds = (nodes) => {
    let ids = [];
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        ids.push(node.field_id);
      } else {
        ids = [...ids, ...getAllLeafIds(node.children)];
      }
    }
    return ids;
  };

  const selectAllHierarchicalFields = () => {
    const allLeafIds = getAllLeafIds(hierarchicalFields);
    setSelectedFieldIds(allLeafIds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      const isDynamic = tabs.find((t) => t.key === activeTab)?.isDynamic;
      const fields = isDynamic
        ? dynamicFormFields
        : FORM_FIELDS[activeTab] || [];

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
      if (
        activeTab === "format_laporan" &&
        selectedDataFields.length === 0 &&
        selectedFieldIds.length === 0
      ) {
        throw new Error("Silakan pilih minimal satu data untuk format laporan");
      }

      setShowConfirm(true);
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleConfirmSave = async () => {
    try {
      const idField = getIdField(activeTab);
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
        processedData.field_ids = selectedFieldIds;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal menyimpan data");

      setShowConfirm(false);
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleToggleStatus = async (item, newStatus) => {
    try {
      const idField = getIdField(activeTab);
      const rowId = item?.[idField] ?? item?.id;

      const response = await fetch(
        `${API_BASE}/${rowId}/status?type=${activeTab}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_aktif: newStatus }),
        },
      );

      if (!response.ok) throw new Error("Gagal mengubah status");
      fetchData();
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // ---------- Derived ----------
  const filteredData = data.filter((item) => {
    // Status filter
    if (
      statusFilter === "active" &&
      !(item.status_aktif === 1 || item.status_aktif === true)
    ) {
      return false;
    }
    if (
      statusFilter === "inactive" &&
      !(item.status_aktif === 0 || item.status_aktif === false)
    ) {
      return false;
    }
    // Search filter
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  // Get columns for table display
  const getTableColumns = () => {
    // Check static table first
    if (TABLE_COLUMNS[activeTab]) {
      return TABLE_COLUMNS[activeTab];
    }

    // For dynamic tables, get from first data row or from dynamicFormFields
    const isDynamic = tabs.find((t) => t.key === activeTab)?.isDynamic;
    if (isDynamic) {
      if (data.length > 0) {
        // Get all columns from first row, exclude _id columns, created_at, and updated_at
        return Object.keys(data[0]).filter(
          (key) =>
            (!key.toLowerCase().endsWith("_id") || key === "status_aktif") &&
            key !== "created_at" &&
            key !== "updated_at",
        );
      } else if (dynamicFormFields.length > 0) {
        // Get from form fields definition
        return dynamicFormFields.map((f) => f.name);
      }
    }

    return [];
  };

  const columns = getTableColumns();

  return (
    <section id="master-data" className="page-section">
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

          {/* Button Kelola Jenis Master Data */}
          <button
            onClick={() => (window.location.href = "/admin/dynamic-master")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.25)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            Kelola Jenis Master
          </button>
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
        {tabs.map((tab) => (
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

      {/* Search and Filter */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", maxWidth: "320px", flex: 1 }}>
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
            <path d="M21 21-4.35-4.35"></path>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "11px 14px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
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
              Daftar {tabs.find((t) => t.key === activeTab)?.label}
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
              maxWidth: activeTab === "format_laporan" ? "1200px" : "480px",
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
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Column 1: Daftar Data */}
                    <div style={{ flex: 1.2 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          Daftar Data
                        </label>
                        <button
                          type="button"
                          onClick={selectAllHierarchicalFields}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: "#4f46e5",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#4338ca")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#4f46e5")
                          }
                        >
                          Pilih Semua
                        </button>
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <input
                          type="text"
                          placeholder="Cari struktur..."
                          value={hierSearchTerm}
                          onChange={(e) => setHierSearchTerm(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "13px",
                            outline: "none",
                            transition: "all 0.2s",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#4f46e5")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e2e8f0")
                          }
                        />
                      </div>
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          height: "350px", // Adjusted for search input
                          overflowY: "auto",
                          backgroundColor: "#f8fafc",
                          padding: "12px",
                        }}
                      >
                        {hierarchicalFields.length > 0 ? (
                          hierarchicalFields.map((node) => (
                            <TreeNode
                              key={node.field_id}
                              node={node}
                              selectedIds={selectedFieldIds}
                              onToggle={toggleHierarchicalField}
                              searchTerm={hierSearchTerm}
                            />
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              color: "#94a3b8",
                            }}
                          >
                            Memuat field struktur...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Selected */}
                    <div style={{ flex: 1.2 }}>
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
                          borderRadius: "12px",
                          height: "400px",
                          overflowY: "auto",
                          backgroundColor: "#ffffff",
                          padding: "10px",
                        }}
                      >
                        {selectedFieldIds.length === 0 ? (
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
                          <>
                            {/* Render Hierarchical Fields */}
                            {selectedFieldIds.map((id) => {
                              const nodeName = findFieldNameById(
                                id,
                                hierarchicalFields,
                              );
                              if (!nodeName) return null;
                              return (
                                <div
                                  key={`hier-${id}`}
                                  onClick={() => {
                                    const node = findNodeById(
                                      id,
                                      hierarchicalFields,
                                    );
                                    if (node) toggleHierarchicalField(node);
                                  }}
                                  style={{
                                    padding: "10px 12px",
                                    marginBottom: "6px",
                                    background:
                                      "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                    borderRadius: "8px",
                                    border: "1px solid #86efac",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    color: "#166534",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#fee2e2";
                                    e.currentTarget.style.borderColor =
                                      "#fca5a5";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)";
                                    e.currentTarget.style.borderColor =
                                      "#86efac";
                                  }}
                                >
                                  <span style={{ fontWeight: 500 }}>
                                    {nodeName}
                                  </span>
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
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
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
                      Status <span style={{ color: "#ef4444" }}>*</span>
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
                      <option value={1}>Aktif</option>
                      <option value={0}>Nonaktif</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Standard Dynamic Form
                (() => {
                  const isDynamic = tabs.find(
                    (t) => t.key === activeTab,
                  )?.isDynamic;
                  const fields = isDynamic
                    ? dynamicFormFields
                    : FORM_FIELDS[activeTab] || [];

                  return fields.map((field) => {
                    let options = field.options || [];
                    if (field.name === "eselon1_id") options = eselon1Options;
                    // Add status_aktif options for BOOLEAN type in dynamic tables
                    if (
                      field.type === "select" &&
                      field.name === "status_aktif"
                    ) {
                      options = [
                        { value: 1, label: "Aktif" },
                        { value: 0, label: "Nonaktif" },
                      ];
                    }

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
                          {field.required && (
                            <span style={{ color: "#ef4444" }}>*</span>
                          )}
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
                  });
                })()
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
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
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
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Konfirmasi
            </h3>
            <p
              style={{
                margin: "0 0 28px",
                color: "#64748b",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
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
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4338ca")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#4f46e5")
                }
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
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#e2e8f0")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#f1f5f9")
                }
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

export default MasterDataSection;
