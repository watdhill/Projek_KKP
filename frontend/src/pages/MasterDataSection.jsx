import { useState, useEffect, Fragment } from "react";
import { authFetch } from "../utils/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "8px",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}

const API_BASE = "http://localhost:5000/api/master-data";

// Tab configuration matching backend (static tabs)
const STATIC_TABS = [
  { key: "eselon1", label: "Eselon 1" },
  { key: "eselon2", label: "Eselon 2" },
  { key: "upt", label: "UPT" },
  { key: "frekuensi_pemakaian", label: "Frekuensi Pemakaian" },
  { key: "format_laporan", label: "Format Laporan" },
  { key: "status_aplikasi", label: "Status Aplikasi" },
  { key: "environment", label: "Ekosistem" },
  { key: "cara_akses", label: "Cara Akses" },
  { key: "pdn", label: "PDN" },
  { key: "pic_internal", label: "PIC Internal" },
  { key: "pic_eksternal", label: "PIC Eksternal" },
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
      name: "no",
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
  pic_internal: [
    {
      name: "eselon1_id",
      label: "Eselon 1",
      type: "select",
      required: true,
      options: [],
    },
    {
      name: "eselon2_id",
      label: "Eselon 2",
      type: "select",
      required: false,
      options: [],
    },
    {
      name: "upt_id",
      label: "UPT",
      type: "select",
      required: false,
      options: [],
    },
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
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
  pic_eksternal: [
    {
      name: "eselon1_id",
      label: "Eselon 1",
      type: "select",
      required: true,
      options: [],
    },
    {
      name: "eselon2_id",
      label: "Eselon 2",
      type: "select",
      required: false,
      options: [],
    },
    {
      name: "upt_id",
      label: "UPT",
      type: "select",
      required: false,
      options: [],
    },
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
      required: true,
      options: [
        { value: 1, label: "Aktif" },
        { value: 0, label: "Nonaktif" },
      ],
    },
  ],
};

// Table column configurations per type
const TABLE_COLUMNS = {
  eselon1: ["no", "nama_eselon1", "singkatan", "status_aktif"],
  eselon2: ["no", "nama_eselon2", "status_aktif"],
  upt: ["nama_upt", "status_aktif"],
  frekuensi_pemakaian: ["nama_frekuensi", "status_aktif"],
  status_aplikasi: ["nama_status", "status_aktif"],
  environment: ["jenis_environment", "status_aktif"],
  cara_akses: ["nama_cara_akses", "status_aktif"],
  pdn: ["kode_pdn", "status_aktif"],
  format_laporan: ["nama_format", "status_aktif"],
  pic_internal: [
    "nama_eselon1",
    "nama_eselon2",
    "nama_upt",
    "nama_pic_internal",
    "email_pic",
    "kontak_pic_internal",
    "status_aktif",
  ],
  pic_eksternal: [
    "nama_eselon1",
    "nama_eselon2",
    "nama_upt",
    "nama_pic_eksternal",
    "keterangan",
    "email_pic",
    "kontak_pic_eksternal",
    "status_aktif",
  ],
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
  pic_internal: "pic_internal_id",
  pic_eksternal: "pic_eksternal_id",
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
  // Individual selection state
  const isSelected = selectedIds.includes(node.field_id);
  const isPartiallySelected =
    !isSelected && leafDescendants.some((id) => selectedIds.includes(id));

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
            checked={isSelected}
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
  const [eselon2Options, setEselon2Options] = useState([]);
  const [uptOptions, setUptOptions] = useState([]);
  const [dynamicFormFields, setDynamicFormFields] = useState([]);
  const [fkDropdownData, setFkDropdownData] = useState({}); // Store FK dropdown options
  // Dynamic table columns

  // State for Format Laporan picker
  const [selectedDataFields, setSelectedDataFields] = useState([]);
  const [availableDataFields, setAvailableDataFields] = useState([
    ...DATA_FIELD_OPTIONS,
  ]);
  const [hierarchicalFields, setHierarchicalFields] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  // Click order tracking for individual fields (fields without parent)
  const [individualFieldClickOrder, setIndividualFieldClickOrder] = useState(
    {},
  );
  const [clickCounter, setClickCounter] = useState(0);

  const [selectedEselon1, setSelectedEselon1] = useState("");
  const [selectedEselon2, setSelectedEselon2] = useState("");
  const [selectedUPT, setSelectedUPT] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hierSearchTerm, setHierSearchTerm] = useState("");

  const [selectedEselon1Filter, setSelectedEselon1Filter] = useState("");

  // Load dynamic tables on mount
  useEffect(() => {
    fetchDynamicTables();
    fetchEselon1Options();
  }, []);

  const fetchEselon1Options = async () => {
    try {
      const response = await fetch(`${API_BASE}?type=eselon1`);
      if (response.ok) {
        const result = await response.json();
        const opts = (result.data || [])
          .filter((item) => item.status_aktif === 1)
          .map((item) => ({
            value: item.eselon1_id,
            label: item.nama_eselon1,
          }));
        setEselon1Options(opts);
      }
    } catch (e) {
      console.error("Failed to fetch Eselon 1 options", e);
    }
  };

  const fetchEselon2Options = async (e1Id) => {
    try {
      const response = await fetch(`${API_BASE}/dropdown?eselon1_id=${e1Id}`);
      if (response.ok) {
        const result = await response.json();
        const opts = (result.data?.eselon2 || []).map((item) => ({
          value: item.eselon2_id,
          label: item.nama_eselon2,
        }));
        setEselon2Options(opts);
      }
    } catch (e) {
      console.error("Failed to fetch Eselon 2 options", e);
    }
  };

  const fetchUptOptions = async (e1Id) => {
    try {
      const response = await fetch(`${API_BASE}/dropdown?eselon1_id=${e1Id}`);
      if (response.ok) {
        const result = await response.json();
        const opts = (result.data?.upt || []).map((item) => ({
          value: item.upt_id,
          label: item.nama_upt,
        }));
        setUptOptions(opts);
      }
    } catch (e) {
      console.error("Failed to fetch UPT options", e);
    }
  };

  useEffect(() => {
    if (
      (activeTab === "pic_internal" || activeTab === "pic_eksternal") &&
      formData.eselon1_id
    ) {
      fetchEselon2Options(formData.eselon1_id);
      fetchUptOptions(formData.eselon1_id);
    }
  }, [formData.eselon1_id, activeTab]);

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
  const formatColumnHeader = (col) => {
    if (col === "jenis_environment") return "Jenis Ekosistem";
    return col
      .replace(/_id$/i, "") // Remove _id suffix for display
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

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
  }, [activeTab, selectedEselon1Filter]);

  const fetchDynamicTableColumns = async () => {
    try {
      // Fetch table info with FK constraints
      const response = await fetch(
        `http://localhost:5000/api/dynamic-master/table-info/${activeTab}`,
      );
      if (!response.ok) return;
      const result = await response.json();

      if (result.success && result.data) {
        const { schema, foreignKeys } = result.data;

        // Fetch dropdown data for all FK columns
        const fkData = {};
        for (const [columnName, fkInfo] of Object.entries(foreignKeys)) {
          try {
            const refTableRes = await fetch(
              `${API_BASE}?type=${fkInfo.referencedTable}`,
            );
            if (refTableRes.ok) {
              const refData = await refTableRes.json();
              if (refData.success && refData.data) {
                // Map data to dropdown options
                // Smartly find the label column (contains 'nama', 'jenis', 'judul', 'kode', or use 2nd column)
                const labelField =
                  Object.keys(refData.data[0]).find(
                    (k) =>
                      k !== fkInfo.referencedColumn &&
                      k !== "created_at" &&
                      k !== "updated_at" &&
                      k !== "status_aktif" &&
                      /nama|jenis|judul|kode|email/i.test(k),
                  ) || Object.keys(refData.data[0])[1];

                const options = refData.data.map((row) => ({
                  value: row[fkInfo.referencedColumn],
                  label: String(row[labelField] || Object.values(row)[1]),
                }));
                fkData[columnName] = options;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch data for FK ${columnName}:`, err);
          }
        }
        setFkDropdownData(fkData);

        // Build form fields
        const fields = schema.map((col) => {
          const field = {
            name: col.column_name,
            label: col.display_name,
            required: !col.is_nullable,
            placeholder: col.display_name,
          };

          // If this column is a foreign key, use select type
          if (col.isForeignKey && fkData[col.column_name]) {
            field.type = "select";
            field.options = fkData[col.column_name];
            field.isForeignKey = true;
            field.referencedTable = col.foreignKeyInfo.referencedTable;
          } else {
            field.type = getInputType(col.column_type);
          }

          return field;
        });

        // Add status_aktif field
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
      let url = `${API_BASE}?type=${activeTab}`;

      // Filter logic
      if (
        (activeTab === "eselon2" || activeTab === "upt") &&
        selectedEselon1Filter
      ) {
        url += `&eselon1_id=${selectedEselon1Filter}`;
      }
      console.log("Fetching Master Data URL:", url);

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

  const fetchHierarchicalFields = async () => {
    try {
      const response = await fetch(`${API_BASE}/laporan-fields`);
      if (!response.ok) return [];
      const result = await response.json();
      const next = result.data || [];
      setHierarchicalFields(next);
      return next;
    } catch (err) {
      console.error("Failed to fetch hierarchical fields:", err);
      return [];
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

    // Special handling for PIC types to ensure dependent fields work
    if (activeTab === "pic_internal" || activeTab === "pic_eksternal") {
      // Ensure IDs are present and handled as strings for dropdown match
      if (item.eselon1_id) editData.eselon1_id = String(item.eselon1_id);
      if (item.eselon2_id) editData.eselon2_id = String(item.eselon2_id);
      if (item.upt_id) editData.upt_id = String(item.upt_id);
    }

    // default status_aktif
    if (editData.status_aktif === undefined) editData.status_aktif = 1;
    setFormData(editData);

    // Handle Format Laporan state loading
    if (activeTab === "format_laporan") {
      (async () => {
        try {
          // Ensure hierarchy is available so labels can render
          let hierarchy = hierarchicalFields;
          if (!hierarchy || hierarchy.length === 0) {
            hierarchy = await fetchHierarchicalFields();
          }

          const res = await fetch(
            `${API_BASE}/${getRowId(item)}?type=format_laporan`,
          );
          const result = await res.json();
          if (!result.success) return;

          const fieldMap = {};
          let maxOrder = 0;
          if (result.data.field_details) {
            result.data.field_details.forEach((d) => {
              if (d.order_index) {
                fieldMap[d.field_id] = d.order_index;
                if (d.order_index > maxOrder) maxOrder = d.order_index;
              }
            });
          }

          const restoredFieldIds = Array.isArray(result.data.field_ids)
            ? result.data.field_ids
            : [];

          setIndividualFieldClickOrder(fieldMap);
          setClickCounter(maxOrder);
          setSelectedFieldIds(restoredFieldIds);

          // Keep legacy picker state in sync (not the source of truth anymore)
          const getAllOptions = (nodes) => {
            let options = [];
            nodes.forEach((node) => {
              options.push({ value: node.field_id, label: node.nama_field });
              if (node.children && node.children.length > 0) {
                options = [...options, ...getAllOptions(node.children)];
              }
            });
            return options;
          };
          const flatOptions = getAllOptions(hierarchy || []);
          const selectedSet = new Set(restoredFieldIds);
          const selectedItems = flatOptions
            .filter((opt) => selectedSet.has(opt.value))
            .sort((a, b) => {
              // Sort based on backend restored order (order_index)
              // This is crucial for "Edit" to show correct order
              const orderA = fieldMap[a.value] || 999999;
              const orderB = fieldMap[b.value] || 999999;
              return orderA - orderB;
            });

          // Re-sync selectedFieldIds based on this sorted order to ensure consistency
          const sortedIds = selectedItems.map(item => item.value);
          setSelectedFieldIds(sortedIds);

          setSelectedDataFields(selectedItems);
          setAvailableDataFields(
            flatOptions.filter((opt) => !selectedSet.has(opt.value)),
          );
        } catch (err) {
          console.error("Error fetching format details:", err);
          setSelectedDataFields([]);
        }
      })();
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
    const isNodeSelected = selectedFieldIds.includes(node.field_id);

    if (isNodeSelected) {
      // Unselect current node AND all descendants
      setSelectedFieldIds((prev) =>
        prev.filter((id) => id !== node.field_id && !targetIds.includes(id)),
      );

      // Remove from click order tracking for ALL fields
      setIndividualFieldClickOrder((prev) => {
        const newOrder = { ...prev };
        delete newOrder[node.field_id];
        // Also remove descendants
        targetIds.forEach((id) => delete newOrder[id]);
        return newOrder;
      });
    } else {
      // Select current node AND all descendants
      setSelectedFieldIds((prev) => {
        const newIds = [...prev];
        if (!newIds.includes(node.field_id)) newIds.push(node.field_id);
        targetIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });

      // Track click order for ALL fields (including grouped fields)
      // Backend will use this to position groups at first field's click order
      setClickCounter((prev) => prev + 1);
      setIndividualFieldClickOrder((prev) => {
        const newOrder = { ...prev };
        const newCount = clickCounter + 1;
        newOrder[node.field_id] = newCount;

        // Add all descendants too
        targetIds.forEach((id) => {
          newOrder[id] = newCount;
        });

        return newOrder;
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

  // Derived states for Select All checkbox
  const allLeafIds = getAllLeafIds(hierarchicalFields);
  const isAllSelected =
    allLeafIds.length > 0 &&
    allLeafIds.every((id) => selectedFieldIds.includes(id));
  const isAnySelected = allLeafIds.some((id) => selectedFieldIds.includes(id));
  const isIndeterminate = isAnySelected && !isAllSelected;

  const toggleSelectAllHierarchicalFields = () => {
    if (isAllSelected) {
      setSelectedFieldIds([]);
    } else {
      setSelectedFieldIds(allLeafIds);
    }
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

      // PIC Internal/Eksternal validation: Must pick Eselon 1 AND one of (Eselon 2 or UPT)
      if (activeTab === "pic_internal" || activeTab === "pic_eksternal") {
        if (!formData.eselon2_id && !formData.upt_id) {
          throw new Error("Silakan pilih salah satu Eselon 2 atau UPT");
        }
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
        // Filter out headers (parents) from field_ids payload
        // Backend hierarchy builder will still function if children are present
        const leafIdsOnly = selectedFieldIds.filter((id) =>
          allLeafIds.includes(id),
        );
        processedData.selected_fields = JSON.stringify(leafIdsOnly);
        processedData.field_ids = leafIdsOnly;

        // Include click order for individual fields (fields without parent)
        processedData.field_click_order = individualFieldClickOrder;
        console.log("Submitting with click order:", individualFieldClickOrder);
      }

      // Inject user ID for audit
      const userStr = localStorage.getItem("user");
      let currentUserId = null;
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.user_id) currentUserId = u.user_id;
          else if (u.id) currentUserId = u.id;
        } catch (e) {
          /* ignore */
        }
      }

      if (currentUserId) {
        if (editingItem) {
          processedData.updated_by = currentUserId;
        } else {
          processedData.created_by = currentUserId;
        }
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
      setSuccessMessage(
        editingItem ? "data berhasil di perbarui" : "data berhasil ditambahkan",
      );
      setShowSuccess(true);
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

  // ---------- Drag and Drop Logic ----------
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Find indexes in the IDs array (Order of Truth)
      const oldIndex = selectedFieldIds.indexOf(active.id);
      const newIndex = selectedFieldIds.indexOf(over.id);

      // Reorder IDs
      const newIds = arrayMove(selectedFieldIds, oldIndex, newIndex);
      setSelectedFieldIds(newIds);

      // Reorder Data Objects (Display) explicitly to match IDs
      // This is crucial because selectedDataFields might have different references
      // We rebuild selectedDataFields based on the new ID order
      const newDataFields = newIds
        .map((id) => selectedDataFields.find((f) => f.value === id))
        .filter((f) => !!f); // Remove undefined if any

      setSelectedDataFields(newDataFields);
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
      if (dynamicFormFields.length > 0) {
        // Get from form fields definition to ensure it matches the form exactly
        return dynamicFormFields
          .map((f) => f.name)
          .filter((name) => name !== "created_by" && name !== "updated_by");
      }
      // Fallback if form fields not loaded yet but data is
      if (data.length > 0) {
        return Object.keys(data[0]).filter(
          (key) =>
            (!key.toLowerCase().endsWith("_id") ||
              key === "status_aktif" ||
              fkDropdownData[key]) &&
            key !== "created_at" &&
            key !== "updated_at" &&
            key !== "created_by" &&
            key !== "updated_by",
        );
      }
    }

    return [];
  };

  const columns = getTableColumns();

  // Adjusted columns for display if grouped by Eselon 1
  const displayColumns =
    (activeTab === "eselon2" ||
      activeTab === "upt" ||
      activeTab === "pic_internal" ||
      activeTab === "pic_eksternal") &&
      !selectedEselon1Filter
      ? columns.filter((c) => c !== "nama_eselon1")
      : columns;

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
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  marginBottom: "2px",
                  fontSize: "18px",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                Master Data
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: 1.3,
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
              color: "#94a3b8",
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
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

        {/* Eselon 1 Filter (For Eselon 2 and UPT tabs) */}
        {(activeTab === "eselon2" || activeTab === "upt") && (
          <select
            value={selectedEselon1Filter}
            onChange={(e) => setSelectedEselon1Filter(e.target.value)}
            style={{
              padding: "11px 14px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              minWidth: "150px",
            }}
          >
            <option value="">Semua Eselon 1</option>
            {eselon1Options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

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
                {displayColumns.map((col) => {
                  const fieldDef = dynamicFormFields.find(
                    (f) => f.name === col,
                  );
                  const label = fieldDef
                    ? fieldDef.label
                    : formatColumnHeader(col);
                  return (
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
                      {label}
                    </th>
                  );
                })}
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
              {/* Special rendering for Eselon 2, UPT, and PIC to group by Eselon 1 when show all */}
              {(activeTab === "eselon2" ||
                activeTab === "upt" ||
                activeTab === "pic_internal" ||
                activeTab === "pic_eksternal") &&
                !selectedEselon1Filter
                ? (() => {
                  // Group data
                  const grouped = {};
                  filteredData.forEach((item) => {
                    const e1Id = item.eselon1_id;
                    if (!grouped[e1Id]) grouped[e1Id] = [];
                    grouped[e1Id].push(item);
                  });

                  // Sort group IDs based on eselon1Options order
                  const sortedE1Ids = Object.keys(grouped).sort((a, b) => {
                    const idxA = eselon1Options.findIndex(
                      (opt) => String(opt.value) === String(a),
                    );
                    const idxB = eselon1Options.findIndex(
                      (opt) => String(opt.value) === String(b),
                    );
                    return idxA - idxB;
                  });

                  // Render groups
                  return sortedE1Ids.map((e1Id) => {
                    // Find Eselon 1 Name
                    const e1Name =
                      eselon1Options.find(
                        (opt) => opt.value === parseInt(e1Id),
                      )?.label || `Eselon 1 ID: ${e1Id}`;

                    return (
                      <Fragment key={`group-container-${e1Id}`}>
                        {/* Group Header */}
                        <tr
                          key={`group-${e1Id}`}
                          style={{
                            backgroundColor: "#e0e7ff",
                            borderBottom: "1px solid #c7d2fe",
                          }}
                        >
                          <td
                            colSpan={displayColumns.length + 1}
                            style={{
                              padding: "10px 14px",
                              fontWeight: 700,
                              color: "#3730a3",
                              fontSize: "13px",
                            }}
                          >
                            {e1Name}
                          </td>
                        </tr>
                        {/* Items in group */}
                        {grouped[e1Id]
                          .sort((a, b) => {
                            // Sort by Eselon 2 name
                            const e2A = a.nama_eselon2 || "";
                            const e2B = b.nama_eselon2 || "";
                            if (e2A.localeCompare(e2B) !== 0)
                              return e2A.localeCompare(e2B);

                            // Then by UPT name
                            const uptA = a.nama_upt || "";
                            const uptB = b.nama_upt || "";
                            if (uptA.localeCompare(uptB) !== 0)
                              return uptA.localeCompare(uptB);

                            // Then by PIC name
                            const nameA =
                              a.nama_pic_internal ||
                              a.nama_pic_eksternal ||
                              "";
                            const nameB =
                              b.nama_pic_internal ||
                              b.nama_pic_eksternal ||
                              "";
                            return nameA.localeCompare(nameB);
                          })
                          .map((item, index) => (
                            <tr
                              key={getRowId(item) ?? index}
                              style={{
                                borderBottom: "1px solid #f1f5f9",
                                backgroundColor: "#ffffff",
                                transition: "all 0.2s",
                                height: "50px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f0f9ff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#ffffff";
                              }}
                            >
                              {displayColumns.map((col) => (
                                <td
                                  key={`${getRowId(item)}-${col}`}
                                  className={
                                    col === "email_pic" ? "allow-lowercase" : ""
                                  }
                                  style={{
                                    padding: "10px 14px",
                                    color: "#334155",
                                    fontWeight: 500,
                                  }}
                                >
                                  {col === "status_aktif" ? (
                                    <span
                                      onClick={() => {
                                        // Toggle status logic
                                        const currentStatus =
                                          item.status_aktif === 1 ||
                                          item.status_aktif === true;
                                        handleToggleStatus(
                                          item,
                                          !currentStatus,
                                        );
                                      }}
                                      style={{
                                        backgroundColor: getStatusColor(
                                          item[col],
                                        ).bg,
                                        color: getStatusColor(item[col]).text,
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "inline-block",
                                      }}
                                    >
                                      {getStatusColor(item[col]).label}
                                    </span>
                                  ) : (
                                    item[col]
                                  )}
                                </td>
                              ))}
                              <td
                                style={{
                                  padding: "10px 14px",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
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
                                      boxShadow:
                                        "0 2px 6px rgba(245, 158, 11, 0.25)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform =
                                        "translateY(-1px)";
                                      e.target.style.boxShadow =
                                        "0 4px 10px rgba(245, 158, 11, 0.35)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform =
                                        "translateY(0)";
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
                      </Fragment>
                    );
                  });
                })()
                : filteredData.map((item, index) => (
                  <tr
                    key={getRowId(item) ?? index}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor:
                        index % 2 === 0 ? "#ffffff" : "#fafbfc",
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
                    {displayColumns.map((col) => (
                      <td
                        key={`${getRowId(item)}-${col}`}
                        className={
                          col === "email_pic" ? "allow-lowercase" : ""
                        }
                        style={{
                          padding: "10px 14px",
                          color: "#334155",
                          fontWeight: 500,
                        }}
                      >
                        {col === "status_aktif" ? (
                          <span
                            style={{
                              backgroundColor: getStatusColor(item[col]).bg,
                              color: getStatusColor(item[col]).text,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "inline-block",
                            }}
                          >
                            {getStatusColor(item[col]).label}
                          </span>
                        ) : fkDropdownData[col] ? (
                          fkDropdownData[col].find(
                            (opt) => String(opt.value) === String(item[col]),
                          )?.label || item[col]
                        ) : (
                          item[col]
                        )}
                      </td>
                    ))}
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
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
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: activeTab === "format_laporan" ? "20px" : "28px",
              width: "100%",
              maxWidth:
                activeTab === "pic_internal" || activeTab === "pic_eksternal"
                  ? "840px"
                  : activeTab === "format_laporan"
                    ? "980px"
                    : "480px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "slideUp 0.3s ease",
              maxHeight: "88vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {activeTab === "format_laporan" ? (
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    paddingRight: "6px",
                  }}
                >
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
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    {/* Column 1: Daftar Data */}
                    <div style={{ flex: "1 1 420px" }}>
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) =>
                              el && (el.indeterminate = isIndeterminate)
                            }
                            onChange={toggleSelectAllHierarchicalFields}
                            style={{
                              cursor: "pointer",
                              width: "16px",
                              height: "16px",
                              accentColor: "#4f46e5",
                            }}
                          />
                          <label
                            onClick={toggleSelectAllHierarchicalFields}
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#4f46e5",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            Pilih Semua
                          </label>
                        </div>
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
                          height: "min(340px, 44vh)",
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
                    <div style={{ flex: "1 1 420px" }}>
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
                          height: "min(380px, 48vh)",
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
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={selectedFieldIds}
                              strategy={verticalListSortingStrategy}
                            >
                              {selectedFieldIds.map((id) => {
                                const nodeName = findFieldNameById(
                                  id,
                                  hierarchicalFields,
                                );
                                // Filter out headers/groups from display list
                                const nodeObj = findNodeById(
                                  id,
                                  hierarchicalFields,
                                );
                                const isHeader =
                                  nodeObj?.children &&
                                  nodeObj.children.length > 0;

                                if (!nodeName || isHeader) return null;
                                return (
                                  <SortableItem key={id} id={id}>
                                    <div
                                      onClick={() => {
                                        const node = findNodeById(
                                          id,
                                          hierarchicalFields,
                                        );
                                        if (node) toggleHierarchicalField(node);
                                      }}
                                      style={{
                                        padding: "10px 12px",
                                        background:
                                          "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                        borderRadius: "8px",
                                        border: "1px solid #86efac",
                                        cursor: "grab",
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
                                        <line
                                          x1="18"
                                          y1="6"
                                          x2="6"
                                          y2="18"
                                        ></line>
                                        <line
                                          x1="6"
                                          y1="6"
                                          x2="18"
                                          y2="18"
                                        ></line>
                                      </svg>
                                    </div>
                                  </SortableItem>
                                );
                              })}
                            </SortableContext>
                          </DndContext>
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

                  const isPicForm =
                    activeTab === "pic_internal" ||
                    activeTab === "pic_eksternal";

                  const formFields = fields.map((field) => {
                    let options = field.options || [];
                    if (field.name === "eselon1_id") options = eselon1Options;
                    if (isPicForm && field.name === "eselon2_id")
                      options = eselon2Options;
                    if (isPicForm && field.name === "upt_id")
                      options = uptOptions;

                    if (
                      field.type === "select" &&
                      field.name === "status_aktif"
                    ) {
                      options = [
                        { value: 1, label: "Aktif" },
                        { value: 0, label: "Nonaktif" },
                      ];
                    }

                    // Exclusive selection logic for PIC forms
                    let disabled = false;
                    if (isPicForm) {
                      if (field.name === "eselon2_id") {
                        disabled = !formData.eselon1_id || !!formData.upt_id;
                      } else if (field.name === "upt_id") {
                        disabled =
                          !formData.eselon1_id || !!formData.eselon2_id;
                      }
                    }

                    return { ...field, options, disabled };
                  });

                  return (
                    <div
                      style={{
                        display: isPicForm ? "grid" : "block",
                        gridTemplateColumns: isPicForm ? "1fr 1fr" : "none",
                        gap: "0 24px",
                      }}
                    >
                      {formFields.map((field) => (
                        <div key={field.name} style={{ marginBottom: "18px" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: field.disabled ? "#94a3b8" : "#374151",
                              transition: "color 0.2s",
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
                              onChange={(e) => {
                                const newVal = e.target.value;
                                const newData = {
                                  ...formData,
                                  [field.name]: newVal,
                                };
                                if (field.name === "eselon1_id") {
                                  newData.eselon2_id = "";
                                  newData.upt_id = "";
                                }
                                setFormData(newData);
                              }}
                              required={field.required}
                              disabled={field.disabled}
                              style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                outline: "none",
                                backgroundColor: field.disabled
                                  ? "#f8fafc"
                                  : "#ffffff",
                                cursor: field.disabled
                                  ? "not-allowed"
                                  : "pointer",
                                transition: "all 0.2s",
                                boxSizing: "border-box",
                                color: field.disabled ? "#94a3b8" : "#1e293b",
                              }}
                              onFocus={(e) => {
                                if (field.disabled) return;
                                e.target.style.borderColor = "#4f46e5";
                                e.target.style.boxShadow =
                                  "0 0 0 3px rgba(79, 70, 229, 0.1)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#e2e8f0";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              <option value="">
                                {field.options.length > 0
                                  ? "-- Pilih --"
                                  : "-- Belum ada pilihan --"}
                              </option>
                              {field.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type || "text"}
                              placeholder={`Masukkan ${field.label.toLowerCase()}`}
                              value={formData[field.name] ?? ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [field.name]: e.target.value,
                                })
                              }
                              required={field.required}
                              disabled={field.disabled}
                              style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                outline: "none",
                                transition: "all 0.2s",
                                boxSizing: "border-box",
                                backgroundColor: field.disabled
                                  ? "#f8fafc"
                                  : "#ffffff",
                                cursor: field.disabled
                                  ? "not-allowed"
                                  : "pointer",
                                color: field.disabled ? "#94a3b8" : "#1e293b",
                              }}
                              onFocus={(e) => {
                                if (field.disabled) return;
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
                      ))}
                    </div>
                  );
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

      {/* --- Success Popup matching Image --- */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "450px",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            {/* Green Checkmark Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#f0fdf4",
                borderRadius: "50%",
                border: "2px solid #dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#475569",
                margin: "0 0 12px",
              }}
            >
              Berhasil!
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#94a3b8",
                margin: "0 0 32px",
                lineHeight: "1.5",
              }}
            >
              {successMessage}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  padding: "10px 28px",
                  backgroundColor: "#7dd3fc",
                  color: "white",
                  border: "2px solid #bae6fd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#38bdf8")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#7dd3fc")
                }
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MasterDataSection;
