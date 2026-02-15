import { useState, useEffect, useRef } from "react";

function OperatorEselon1DataAplikasi() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const messageTimerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterEselon2, setFilterEselon2] = useState("");
  const [filterUpt, setFilterUpt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalAppName, setOriginalAppName] = useState("");
  const [master, setMaster] = useState({});
  const [dynamicTables, setDynamicTables] = useState([]);
  const [dynamicMasterData, setDynamicMasterData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userPenggunaSelected, setUserPenggunaSelected] = useState([]);
  const [userPenggunaLainnya, setUserPenggunaLainnya] = useState("");
  const [unitPengembangType, setUnitPengembangType] = useState("");
  const [unitPengembangEksternal, setUnitPengembangEksternal] = useState("");
  const [unitOperasionalTeknologiType, setUnitOperasionalTeknologiType] =
    useState("");
  const [unitOperasionalTeknologiLainnya, setUnitOperasionalTeknologiLainnya] =
    useState("");
  const [pusatKomputasiUtamaType, setPusatKomputasiUtamaType] = useState("");
  const [pusatKomputasiUtamaLainnya, setPusatKomputasiUtamaLainnya] =
    useState("");
  const [pusatKomputasiBackupType, setPusatKomputasiBackupType] = useState("");
  const [pusatKomputasiBackupLainnya, setPusatKomputasiBackupLainnya] =
    useState("");
  const [mandiriKomputasiBackupType, setMandiriKomputasiBackupType] =
    useState("");
  const [mandiriKomputasiBackupLainnya, setMandiriKomputasiBackupLainnya] =
    useState("");
  const [cloudType, setCloudType] = useState("");
  const [cloudYaText, setCloudYaText] = useState("");
  const [sslType, setSslType] = useState("");
  const [sslUnitKerja, setSslUnitKerja] = useState("");
  const [antivirusType, setAntivirusType] = useState("");
  const [antivirusYaText, setAntivirusYaText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama_aplikasi: "",
    domain: "",
    deskripsi_fungsi: "",
    user_pengguna: "",
    data_digunakan: "",
    luaran_output: "",
    eselon1_id: "",
    eselon2_id: "",
    upt_id: "",
    cara_akses_id: [],
    frekuensi_pemakaian: "",
    status_aplikasi: "",
    pdn_id: "",
    pdn_backup: "",
    environment_id: "",
    pic_internal: "",
    pic_eksternal: "",
    kontak_pic_internal: "",
    kontak_pic_eksternal: "",
    bahasa_pemrograman: "",
    basis_data: "",
    kerangka_pengembangan: "",
    unit_pengembang: "",
    unit_operasional_teknologi: "",
    nilai_pengembangan_aplikasi: "",
    pusat_komputasi_utama: "",
    pusat_komputasi_backup: "",
    mandiri_komputasi_backup: "",
    perangkat_lunak: "",
    cloud: "",
    ssl: "",
    ssl_expired: "",
    alamat_ip_publik: "",
    keterangan: "",
    status_bmn: "",
    server_aplikasi: "",
    tipe_lisensi_bahasa: "",
    api_internal_status: "",
    waf: "",
    waf_lainnya: "",
    va_pt_status: "",
    va_pt_waktu: "",
    antivirus: "",
    akses_aplikasi_username: "",
    akses_aplikasi_password: "",
    akses_aplikasi_konfirmasi_password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const errorBorderColor = "#ef4444";
  const errorRing = "0 0 0 3px rgba(239, 68, 68, 0.12)";
  const errorBoxShadow = errorRing;

  const showMessage = (type, text, timeoutMs = 3500) => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }

    setMessage({ type, text });

    if (timeoutMs && timeoutMs > 0) {
      messageTimerRef.current = setTimeout(() => {
        setMessage({ type: "", text: "" });
        messageTimerRef.current = null;
      }, timeoutMs);
    }
  };

  // Get operator's eselon1_id from localStorage
  const userEselon1Id = localStorage.getItem("eselon1_id");
  const userNamaEselon1 = localStorage.getItem("namaEselon1");

  const isActiveFlag = (v) => v === true || v === 1 || v === "1";

  const USER_PENGGUNA_OPTIONS = [
    { value: "internal_kkp", label: "Internal KKP" },
    { value: "internal_eselon_1", label: "Internal Eselon 1" },
    { value: "internal_eselon_2", label: "Internal Eselon 2" },
    { value: "internal_unit_kerja", label: "Internal Unit Kerja" },
    { value: "stakeholder", label: "Stakeholder" },
    { value: "publik", label: "Publik" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const buildUserPenggunaString = (selectedValues, lainnyaText) => {
    const selected = Array.isArray(selectedValues) ? selectedValues : [];
    const labelByValue = new Map(
      USER_PENGGUNA_OPTIONS.map((o) => [o.value, o.label]),
    );
    const parts = selected
      .filter((v) => v !== "lainnya")
      .map((v) => labelByValue.get(v) || v);

    if (selected.includes("lainnya")) {
      const text = (lainnyaText || "").trim();
      if (text) parts.push(text);
    }

    return parts.join(", ");
  };

  const parseUserPenggunaString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { selected: [], lainnyaText: "" };

    const tokens = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const norm = (s) =>
      String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const valueByNorm = new Map();
    USER_PENGGUNA_OPTIONS.forEach((opt) => {
      valueByNorm.set(norm(opt.label), opt.value);
    });

    const selected = [];
    const unknown = [];

    tokens.forEach((token) => {
      const n = norm(token);
      const val = valueByNorm.get(n);
      if (val) {
        if (!selected.includes(val)) selected.push(val);
      } else {
        unknown.push(token);
      }
    });

    let lainnyaText = "";
    if (unknown.length > 0) {
      lainnyaText = unknown.join(", ");
      if (!selected.includes("lainnya")) selected.push("lainnya");
    }

    return { selected, lainnyaText };
  };

  const buildUnitPengembangString = (type, eksternalText) => {
    if (type === "sekretariat_eselon_1") return "Sekretariat Eselon 1";
    if (type === "internal_eselon_2") return "Internal Eselon 2";
    if (type === "eksternal") {
      const text = (eksternalText || "").trim();
      return text ? `Eksternal - ${text}` : "Eksternal";
    }
    return "";
  };

  const parseUnitPengembangString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", eksternalText: "" };

    const lower = raw.toLowerCase();
    if (
      lower.includes("sekretariat") &&
      lower.includes("eselon") &&
      lower.includes("1")
    ) {
      return { type: "sekretariat_eselon_1", eksternalText: "" };
    }
    if (
      lower.includes("internal") &&
      lower.includes("eselon") &&
      lower.includes("2")
    ) {
      return { type: "internal_eselon_2", eksternalText: "" };
    }

    // Handle "Eksternal - <text>"
    if (lower.startsWith("eksternal -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "eksternal",
          eksternalText: parts.slice(1).join("-").trim(),
        };
      }
    }

    // Default to eksternal for any other value (direct text)
    return { type: "eksternal", eksternalText: raw };
  };

  const buildUnitOperasionalTeknologiString = (type, lainnyaText) => {
    if (type === "pusdatin") return "Pusdatin";
    if (type === "lainnya") return (lainnyaText || "").trim();
    return "";
  };

  const parseUnitOperasionalTeknologiString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", lainnyaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "pusdatin") {
      return { type: "pusdatin", lainnyaText: "" };
    }

    // Check if it was saved with "Lainnya - " prefix previously, strip it
    if (lower.startsWith("lainnya -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "lainnya",
          lainnyaText: parts.slice(1).join("-").trim(),
        };
      }
    }

    // Default to lainnya for any other value
    return { type: "lainnya", lainnyaText: raw };
  };

  const buildPusatKomputasiUtamaString = (type, lainnyaText) => {
    if (type === "dc_gambir") return "DC Gambir";
    if (type === "dc_cyber") return "DC Cyber";
    if (type === "lainnya") return (lainnyaText || "").trim();
    if (type === "tidak_ada") return "Tidak Ada";
    return "";
  };

  const parsePusatKomputasiUtamaString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", lainnyaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "dc gambir" || lower === "dcgambir") {
      return { type: "dc_gambir", lainnyaText: "" };
    }
    if (lower === "dc cyber" || lower === "dccyber") {
      return { type: "dc_cyber", lainnyaText: "" };
    }
    if (lower === "tidak ada") {
      return { type: "tidak_ada", lainnyaText: "" };
    }

    // Check if it was saved with "Lainnya - " prefix previously, strip it
    if (lower.startsWith("lainnya -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "lainnya",
          lainnyaText: parts.slice(1).join("-").trim(),
        };
      }
    }

    // Default to lainnya for any other value
    return { type: "lainnya", lainnyaText: raw };
  };

  const buildPusatKomputasiBackupString = (type, lainnyaText) => {
    if (type === "dc_gambir") return "DC Gambir";
    if (type === "dc_cyber") return "DC Cyber";
    if (type === "lainnya") return (lainnyaText || "").trim();
    if (type === "tidak_ada") return "Tidak Ada";
    return "";
  };

  const parsePusatKomputasiBackupString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", lainnyaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "dc gambir" || lower === "dcgambir") {
      return { type: "dc_gambir", lainnyaText: "" };
    }
    if (lower === "dc cyber" || lower === "dccyber") {
      return { type: "dc_cyber", lainnyaText: "" };
    }
    if (lower === "tidak ada") {
      return { type: "tidak_ada", lainnyaText: "" };
    }

    // Check if it was saved with "Lainnya - " prefix previously, strip it
    if (lower.startsWith("lainnya -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "lainnya",
          lainnyaText: parts.slice(1).join("-").trim(),
        };
      }
    }

    // Default to lainnya for any other value
    return { type: "lainnya", lainnyaText: raw };
  };

  const buildMandiriKomputasiBackupString = (type, lainnyaText) => {
    if (type === "ex_storage") return "Ex STORAGE";
    if (type === "in_storage") return "In STORAGE";
    if (type === "ex_cloud") return "Ex CLOUD";
    if (type === "tidak_ada") return "TIDAK ADA";
    if (type === "lainnya") {
      return (lainnyaText || "").trim();
    }
    return "";
  };

  const parseMandiriKomputasiBackupString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", lainnyaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "ex storage" || lower === "exstorage") {
      return { type: "ex_storage", lainnyaText: "" };
    }
    if (lower === "in storage" || lower === "instorage") {
      return { type: "in_storage", lainnyaText: "" };
    }
    if (lower === "ex cloud" || lower === "excloud") {
      return { type: "ex_cloud", lainnyaText: "" };
    }
    if (lower === "tidak ada") {
      return { type: "tidak_ada", lainnyaText: "" };
    }

    // Check if it was saved with "Lainnya - " prefix previously, strip it
    if (lower.startsWith("lainnya -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "lainnya",
          lainnyaText: parts.slice(1).join("-").trim(),
        };
      }
    }

    // Default to lainnya for any other value (just the text)
    return { type: "lainnya", lainnyaText: raw };
  };

  const buildCloudString = (type, yaText) => {
    if (type === "ya") {
      const text = (yaText || "").trim();
      return text ? `Ya - ${text}` : "Ya";
    }
    if (type === "tidak") return "Tidak";
    return "";
  };

  const parseCloudString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", yaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "tidak") {
      return { type: "tidak", yaText: "" };
    }

    // Handle "Ya - <text>"
    if (lower.startsWith("ya -")) {
      const parts = raw.split("-");
      if (parts.length > 1) {
        return {
          type: "ya",
          yaText: parts.slice(1).join("-").trim()
        };
      }
    }

    // Any other value is considered as "Ya" with text
    return { type: "ya", yaText: raw };
  };

  const buildSslString = (type, unitKerjaText) => {
    if (type === "aktif_pusdatin") return "Aktif/Pusdatin";
    if (type === "aktif_unit_kerja") {
      const text = (unitKerjaText || "").trim();
      return text ? `Aktif/Unit Kerja - ${text}` : "Aktif/Unit Kerja";
    }
    return "";
  };

  const parseSslString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", unitKerjaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "aktif/pusdatin" || lower === "aktifpusdatin") {
      return { type: "aktif_pusdatin", unitKerjaText: "" };
    }

    // Check if it starts with "Aktif/" (handling new format and possible legacy)
    if (lower.startsWith("aktif/")) {
      const afterSlash = raw.substring(6).trim(); // Get text after "Aktif/"
      if (afterSlash.toLowerCase().includes("pusdatin")) {
        return { type: "aktif_pusdatin", unitKerjaText: "" };
      }

      const afterLower = afterSlash.toLowerCase();
      // Check for "Unit Kerja - <text>" or "Unit Kerja"
      if (afterLower.startsWith("unit kerja")) {
        // Check for " - " separator
        const separatorIndex = afterSlash.indexOf("-");
        if (separatorIndex !== -1) {
          return { type: "aktif_unit_kerja", unitKerjaText: afterSlash.substring(separatorIndex + 1).trim() };
        }
        // No separator, check if it's just "Unit Kerja"
        const remainder = afterSlash.substring(10).trim(); // "Unit Kerja".length = 10
        if (!remainder) return { type: "aktif_unit_kerja", unitKerjaText: "" };

        return { type: "aktif_unit_kerja", unitKerjaText: remainder };
      }

      // If it is just "Aktif/<text>", assume text is Unit Kerja
      if (afterSlash) {
        return { type: "aktif_unit_kerja", unitKerjaText: afterSlash };
      }
    }

    // If contains "aktif/unit kerja" pattern (old format)
    if (lower.includes("aktif/unit kerja")) {
      const match = raw.match(/aktif\/unit kerja(?:\s*-\s*(.+))?/i);
      const unitKerjaText = match && match[1] ? match[1].trim() : "";
      return { type: "aktif_unit_kerja", unitKerjaText };
    }
    // Default to aktif_unit_kerja with the raw value as unit kerja
    return { type: "aktif_unit_kerja", unitKerjaText: raw };
  };

  const buildAntivirusString = (type, yaText) => {
    if (type === "ya") return (yaText || "").trim();
    if (type === "tidak") return "Tidak";
    return "";
  };

  const parseAntivirusString = (value) => {
    const raw = (value || "").trim();
    if (!raw) return { type: "", yaText: "" };

    const lower = raw.toLowerCase();
    if (lower === "tidak") {
      return { type: "tidak", yaText: "" };
    }
    // Any other value is considered as "Ya" with text
    return { type: "ya", yaText: raw };
  };

  // fetch apps function (reusable)
  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/aplikasi");
      if (!response.ok) throw new Error("Gagal mengambil data aplikasi");
      const data = await response.json();
      // Filter hanya aplikasi dari eselon1 operator
      const filteredApps = (data.data || []).filter(
        (app) => String(app.eselon1_id) === String(userEselon1Id),
      );
      setApps(filteredApps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    fetchMasterDropdowns();
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  // Ensure Eselon 1 is auto-filled (even if localStorage only has nama)
  useEffect(() => {
    if (!showModal) return;
    if (formData.eselon1_id) return;

    if (userEselon1Id) {
      setFormData((prev) => ({ ...prev, eselon1_id: String(userEselon1Id) }));
      return;
    }

    const eselon1List = master.eselon1 || [];
    if (userNamaEselon1 && eselon1List.length > 0) {
      const match = eselon1List.find(
        (x) =>
          String(x?.nama_eselon1 || "")
            .trim()
            .toLowerCase() === String(userNamaEselon1).trim().toLowerCase(),
      );
      if (match?.eselon1_id != null) {
        setFormData((prev) => ({
          ...prev,
          eselon1_id: String(match.eselon1_id),
        }));
      }
    }
  }, [showModal, formData.eselon1_id, userEselon1Id, userNamaEselon1, master]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, filterEselon2, filterUpt]);

  const filtered = apps.filter((a) => {
    if (statusFilter !== "all") {
      const status = (a.nama_status || "").toLowerCase();
      if (status !== statusFilter) return false;
    }

    if (filterEselon2) {
      if (String(a.eselon2_id) !== String(filterEselon2)) return false;
    }

    if (filterUpt) {
      if (a.upt_id !== parseInt(filterUpt)) return false;
    }

    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (a.nama_aplikasi || "").toLowerCase().includes(s) ||
      (a.pic_internal || "").toLowerCase().includes(s) ||
      (a.nama_eselon1 || "").toLowerCase().includes(s)
    );
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    if (!sortColumn) return 0;

    if (sortColumn === "status") {
      const statusPriority = {
        "aktif": 1,
        "pengembangan": 2,
        "tidak aktif": 3,
      };

      const getStatusKey = (app) => {
        const status = (app.nama_status || "Aktif").toLowerCase();
        if (status === "aktif") return "aktif";
        if (status.includes("pengembang") || status.includes("pengembangan") || status.includes("dibangun") || status.includes("sedang")) {
          return "pengembangan";
        }
        return "tidak aktif";
      };

      const statusA = getStatusKey(a);
      const statusB = getStatusKey(b);
      const priorityA = statusPriority[statusA] || 999;
      const priorityB = statusPriority[statusB] || 999;

      if (sortDirection === "asc") {
        return priorityA - priorityB;
      } else {
        return priorityB - priorityA;
      }
    }

    if (sortColumn === "ssl_expired") {
      const dateA = a.ssl_expired ? new Date(a.ssl_expired) : null;
      const dateB = b.ssl_expired ? new Date(b.ssl_expired) : null;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // null dates go to the end
      if (!dateB) return -1;

      if (sortDirection === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    }

    return 0;
  });

  // Pagination calculation (use sorted data instead of filtered)
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApps = sorted.slice(startIndex, endIndex);
  const shownCount = Math.min(currentPage * itemsPerPage, sorted.length);

  // Handle sorting toggle
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (app) => {
    const status = (app.nama_status || "Aktif").toLowerCase();
    if (status === "aktif")
      return { label: "Aktif", bg: "#dcfce7", color: "#166534" };
    if (status.includes("pengembang") || status.includes("pengembangan") || status.includes("dibangun") || status.includes("sedang"))
      return {
        label: app.nama_status || "Pengembangan",
        bg: "#fed7aa",
        color: "#c2410c",
      };
    return {
      label: app.nama_status || "Tidak Aktif",
      bg: "#fee2e2",
      color: "#991b1b",
    };
  };

  // Fetch master data for dropdowns
  const fetchMasterDropdowns = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/master-data/dropdown");
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        setMaster(result.data);
      }
    } catch (e) {
      console.error("Failed to fetch master dropdowns", e);
    }

    // Fetch dynamic master tables
    try {
      const dynRes = await fetch(
        "http://localhost:5000/api/dynamic-master/tables",
      );
      if (!dynRes.ok) return;
      const dynResult = await dynRes.json();
      if (dynResult.success && dynResult.data) {
        const activeTables = dynResult.data.filter(
          (t) => t.status_aktif === 1 || t.status_aktif === true,
        );
        setDynamicTables(activeTables);

        // Fetch data untuk setiap dynamic table
        const dynamicData = {};
        for (const table of activeTables) {
          try {
            const dataRes = await fetch(
              `http://localhost:5000/api/master-data?type=${table.table_name}`,
            );
            if (dataRes.ok) {
              const dataResult = await dataRes.json();
              if (dataResult.success && dataResult.data) {
                dynamicData[table.table_name] = dataResult.data;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch data for ${table.table_name}:`, err);
          }
        }
        setDynamicMasterData(dynamicData);
      }
    } catch (e) {
      console.error("Failed to fetch dynamic master tables", e);
    }
  };

  // Fetch PIC based on eselon2_id or upt_id
  const fetchPICData = async (eselon2_id, upt_id) => {
    // Reset PIC jika kedua parameter kosong
    if (!eselon2_id && !upt_id) {
      setMaster((prev) => ({
        ...prev,
        pic_internal: [],
        pic_eksternal: [],
      }));
      return;
    }

    try {
      // Prioritas UPT jika keduanya ada (seharusnya tidak terjadi karena mutual exclusive)
      const queryParam = upt_id
        ? `upt_id=${upt_id}`
        : `eselon2_id=${eselon2_id}`;

      const res = await fetch(
        `http://localhost:5000/api/master-data/dropdown?${queryParam}`,
      );
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        // Update hanya pic_internal dan pic_eksternal
        setMaster((prev) => ({
          ...prev,
          pic_internal: result.data.pic_internal || [],
          pic_eksternal: result.data.pic_eksternal || [],
        }));
      }
    } catch (e) {
      console.error("Failed to fetch PIC data", e);
    }
  };

  // Open modal and load master data
  const openModal = async () => {
    await fetchMasterDropdowns();
    setEditMode(false);
    setOriginalAppName("");
    setFieldErrors({});
    setUserPenggunaSelected([]);
    setUserPenggunaLainnya("");
    setUnitPengembangType("");
    setUnitPengembangEksternal("");
    setUnitOperasionalTeknologiType("");
    setUnitOperasionalTeknologiLainnya("");
    setPusatKomputasiUtamaType("");
    setPusatKomputasiUtamaLainnya("");
    setPusatKomputasiBackupType("");
    setPusatKomputasiBackupLainnya("");
    setMandiriKomputasiBackupType("");
    setMandiriKomputasiBackupLainnya("");
    setCloudType("");
    setCloudYaText("");
    setSslType("");
    setSslUnitKerja("");
    setAntivirusType("");
    setAntivirusYaText("");
    // Auto-set eselon1_id dari operator
    const baseFormData = {
      nama_aplikasi: "",
      domain: "",
      deskripsi_fungsi: "",
      user_pengguna: "",
      data_digunakan: "",
      luaran_output: "",
      eselon1_id: userEselon1Id ? String(userEselon1Id) : "",
      eselon2_id: "",
      upt_id: "",
      cara_akses_id: [],
      frekuensi_pemakaian: "",
      status_aplikasi: "",
      pdn_id: "",
      pdn_backup: "",
      environment_id: "",
      pic_internal: "",
      pic_eksternal: "",
      kontak_pic_internal: "",
      kontak_pic_eksternal: "",
      bahasa_pemrograman: "",
      basis_data: "",
      kerangka_pengembangan: "",
      unit_pengembang: "",
      unit_operasional_teknologi: "",
      nilai_pengembangan_aplikasi: "",
      pusat_komputasi_utama: "",
      pusat_komputasi_backup: "",
      mandiri_komputasi_backup: "",
      perangkat_lunak: "",
      cloud: "",
      ssl: "",
      ssl_expired: "",
      alamat_ip_publik: "",
      keterangan: "",
      status_bmn: "",
      server_aplikasi: "",
      tipe_lisensi_bahasa: "",
      api_internal_status: "",
      waf: "",
      waf_lainnya: "",
      va_pt_status: "",
      va_pt_waktu: "",
      antivirus: "",
      akses_aplikasi_username: "",
      akses_aplikasi_password: "",
      akses_aplikasi_konfirmasi_password: "",
    };

    // Add dynamic fields
    dynamicTables.forEach((table) => {
      const fieldName = `${table.table_name}_id`;
      baseFormData[fieldName] = "";
    });

    setFormData(baseFormData);
    setShowModal(true);
  };

  // Open edit modal with pre-filled data
  const openEditModal = async (appName) => {
    try {
      await fetchMasterDropdowns();
      setFieldErrors({});
      setUserPenggunaSelected([]);
      setUserPenggunaLainnya("");
      setUnitPengembangType("");
      setUnitPengembangEksternal("");
      setUnitOperasionalTeknologiType("");
      setUnitOperasionalTeknologiLainnya("");
      setPusatKomputasiUtamaType("");
      setPusatKomputasiUtamaLainnya("");
      setPusatKomputasiBackupType("");
      setPusatKomputasiBackupLainnya("");
      setMandiriKomputasiBackupType("");
      setMandiriKomputasiBackupLainnya("");
      setCloudType("");
      setCloudYaText("");
      setSslType("");
      setSslUnitKerja("");
      setAntivirusType("");
      setAntivirusYaText("");
      const res = await fetch(
        `http://localhost:5000/api/aplikasi/${encodeURIComponent(appName)}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil detail aplikasi");
      const result = await res.json();
      const app = result.data;

      // Pre-fill form with existing data
      const baseFormData = {
        nama_aplikasi: app.nama_aplikasi || "",
        domain: app.domain || "",
        deskripsi_fungsi: app.deskripsi_fungsi || "",
        user_pengguna: app.user_pengguna || "",
        data_digunakan: app.data_digunakan || "",
        luaran_output: app.luaran_output || "",
        eselon1_id: userEselon1Id
          ? String(userEselon1Id)
          : app.eselon1_id
            ? String(app.eselon1_id)
            : "",
        eselon2_id: app.eselon2_id ? String(app.eselon2_id) : "",
        upt_id: app.upt_id ? String(app.upt_id) : "",
        cara_akses_id: (() => {
          try {
            // Try to parse from cara_akses_multiple first (new column)
            if (app.cara_akses_multiple) {
              return JSON.parse(app.cara_akses_multiple);
            }
            // Fallback to single cara_akses_id
            return app.cara_akses_id ? [String(app.cara_akses_id)] : [];
          } catch {
            // If parsing fails, use cara_akses_id as single item
            return app.cara_akses_id ? [String(app.cara_akses_id)] : [];
          }
        })(),
        frekuensi_pemakaian: app.frekuensi_pemakaian
          ? String(app.frekuensi_pemakaian)
          : "",
        status_aplikasi: app.status_aplikasi ? String(app.status_aplikasi) : "",
        pdn_id: app.pdn_id ? String(app.pdn_id) : "",
        pdn_backup: app.pdn_backup || "",
        environment_id: app.environment_id ? String(app.environment_id) : "",
        pic_internal: app.pic_internal || "",
        pic_eksternal: app.pic_eksternal || "",
        kontak_pic_internal: app.kontak_pic_internal || "",
        kontak_pic_eksternal: app.kontak_pic_eksternal || "",
        bahasa_pemrograman: app.bahasa_pemrograman || "",
        basis_data: app.basis_data || "",
        kerangka_pengembangan: app.kerangka_pengembangan || "",
        unit_pengembang: app.unit_pengembang || "",
        unit_operasional_teknologi: app.unit_operasional_teknologi || "",
        nilai_pengembangan_aplikasi: app.nilai_pengembangan_aplikasi || "",
        pusat_komputasi_utama: app.pusat_komputasi_utama || "",
        pusat_komputasi_backup: app.pusat_komputasi_backup || "",
        mandiri_komputasi_backup: app.mandiri_komputasi_backup || "",
        perangkat_lunak: app.perangkat_lunak || "",
        cloud: app.cloud || "",
        ssl: app.ssl || "",
        ssl_expired: app.ssl_expired
          ? (() => {
            const date = new Date(app.ssl_expired);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          })()
          : "",
        alamat_ip_publik: app.alamat_ip_publik || "",
        keterangan: app.keterangan || "",
        status_bmn: app.status_bmn || "",
        server_aplikasi: app.server_aplikasi || "",
        tipe_lisensi_bahasa: app.tipe_lisensi_bahasa || "",
        api_internal_status: app.api_internal_status || "",
        waf: app.waf || "",
        waf_lainnya: app.waf_lainnya || "",
        va_pt_status: app.va_pt_status || "",
        va_pt_waktu: app.va_pt_waktu || "",
        antivirus: app.antivirus || "",
        akses_aplikasi_username: app.akses_aplikasi_username || "",
        akses_aplikasi_password: app.akses_aplikasi_password || "",
        akses_aplikasi_konfirmasi_password: app.akses_aplikasi_password || "",
      };

      // Add dynamic fields with prefill from database
      dynamicTables.forEach((table) => {
        const fieldName = `${table.table_name}_id`;
        baseFormData[fieldName] = app[fieldName] ? String(app[fieldName]) : "";
      });

      setFormData(baseFormData);

      // Parse user_pengguna untuk checkbox
      const parsed = parseUserPenggunaString(app.user_pengguna);
      setUserPenggunaSelected(parsed.selected);
      setUserPenggunaLainnya(parsed.lainnyaText);

      // Parse unit_pengembang untuk radio button
      const parsedUnitPengembang = parseUnitPengembangString(
        app.unit_pengembang,
      );
      setUnitPengembangType(parsedUnitPengembang.type);
      setUnitPengembangEksternal(parsedUnitPengembang.eksternalText);

      // Parse unit_operasional_teknologi untuk radio button
      const parsedUnitOperasional = parseUnitOperasionalTeknologiString(
        app.unit_operasional_teknologi,
      );
      setUnitOperasionalTeknologiType(parsedUnitOperasional.type);
      setUnitOperasionalTeknologiLainnya(parsedUnitOperasional.lainnyaText);

      // Parse pusat_komputasi_utama untuk radio button
      const parsedPusatKomputasiUtama = parsePusatKomputasiUtamaString(
        app.pusat_komputasi_utama,
      );
      setPusatKomputasiUtamaType(parsedPusatKomputasiUtama.type);
      setPusatKomputasiUtamaLainnya(parsedPusatKomputasiUtama.lainnyaText);

      // Parse pusat_komputasi_backup untuk radio button
      const parsedPusatKomputasiBackup = parsePusatKomputasiBackupString(
        app.pusat_komputasi_backup,
      );
      setPusatKomputasiBackupType(parsedPusatKomputasiBackup.type);
      setPusatKomputasiBackupLainnya(parsedPusatKomputasiBackup.lainnyaText);

      // Parse mandiri_komputasi_backup untuk radio button
      const parsedMandiriKomputasiBackup = parseMandiriKomputasiBackupString(
        app.mandiri_komputasi_backup,
      );
      setMandiriKomputasiBackupType(parsedMandiriKomputasiBackup.type);
      setMandiriKomputasiBackupLainnya(
        parsedMandiriKomputasiBackup.lainnyaText,
      );

      // Parse cloud untuk radio button
      const parsedCloud = parseCloudString(app.cloud);
      setCloudType(parsedCloud.type);
      setCloudYaText(parsedCloud.yaText);

      // Parse ssl untuk radio button
      const parsedSsl = parseSslString(app.ssl);
      setSslType(parsedSsl.type);
      setSslUnitKerja(parsedSsl.unitKerjaText);

      // Parse antivirus untuk radio button
      const parsedAntivirus = parseAntivirusString(app.antivirus);
      setAntivirusType(parsedAntivirus.type);
      setAntivirusYaText(parsedAntivirus.yaText);

      // Fetch PIC berdasarkan eselon2_id atau upt_id (prioritas UPT)
      if (app.upt_id) {
        await fetchPICData("", String(app.upt_id));
      } else if (app.eselon2_id) {
        await fetchPICData(String(app.eselon2_id), "");
      }

      setEditMode(true);
      setOriginalAppName(appName);
      setShowModal(true);
    } catch (err) {
      showMessage("error", "Error: " + (err.message || err), 6000);
    }
  };

  const handleFormChange = (k, v) => {
    setFormData((prev) => ({ ...prev, [k]: v }));

    // Jika eselon2_id berubah, reset UPT (mutual exclusive) dan fetch PIC
    if (k === "eselon2_id") {
      const newEselon2 = v;
      setFormData((prev) => ({
        ...prev,
        eselon2_id: newEselon2,
        upt_id: "", // Reset UPT karena mutual exclusive
        pic_internal: "",
        pic_eksternal: "",
        kontak_pic_internal: "",
        kontak_pic_eksternal: "",
      }));
      // Fetch PIC berdasarkan eselon2
      fetchPICData(newEselon2, "");
      return; // Early return
    }

    // Jika upt_id berubah, reset Eselon2 (mutual exclusive) dan fetch PIC
    if (k === "upt_id") {
      const newUpt = v;
      setFormData((prev) => ({
        ...prev,
        upt_id: newUpt,
        eselon2_id: "", // Reset Eselon2 karena mutual exclusive
        pic_internal: "",
        pic_eksternal: "",
        kontak_pic_internal: "",
        kontak_pic_eksternal: "",
      }));
      // Fetch PIC berdasarkan UPT
      fetchPICData("", newUpt);
      return; // Early return
    }

    // Jika pic_internal berubah, auto-fill kontak dari master
    if (k === "pic_internal") {
      if (v && v !== "Tidak Ada" && v !== "") {
        const selectedPIC = (master.pic_internal || []).find(
          (pic) => pic.nama_pic_internal === v,
        );
        if (selectedPIC && selectedPIC.kontak_pic_internal) {
          setFormData((prev) => ({
            ...prev,
            [k]: v,
            kontak_pic_internal: selectedPIC.kontak_pic_internal,
          }));
        }
      } else {
        // Reset kontak jika "Tidak Ada" atau kosong
        setFormData((prev) => ({
          ...prev,
          [k]: v,
          kontak_pic_internal: "",
        }));
      }
    }

    // Jika pic_eksternal berubah, auto-fill kontak dari master
    if (k === "pic_eksternal") {
      if (v && v !== "Tidak Ada" && v !== "") {
        const selectedPIC = (master.pic_eksternal || []).find(
          (pic) => pic.nama_pic_eksternal === v,
        );
        if (selectedPIC && selectedPIC.kontak_pic_eksternal) {
          setFormData((prev) => ({
            ...prev,
            [k]: v,
            kontak_pic_eksternal: selectedPIC.kontak_pic_eksternal,
          }));
        }
      } else {
        // Reset kontak jika "Tidak Ada" atau kosong
        setFormData((prev) => ({
          ...prev,
          [k]: v,
          kontak_pic_eksternal: "",
        }));
      }
    }

    setFieldErrors((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;

      const next = { ...prev };

      const hasKeyError = Object.prototype.hasOwnProperty.call(next, k);
      const shouldAlsoClear =
        (k === "waf" &&
          Object.prototype.hasOwnProperty.call(next, "waf_lainnya")) ||
        (k === "va_pt_status" &&
          Object.prototype.hasOwnProperty.call(next, "va_pt_waktu"));

      if (!hasKeyError && !shouldAlsoClear) return prev;

      const isEmptyValue = (() => {
        if (k === "cara_akses_id") return !Array.isArray(v) || v.length === 0;
        if (v === null || v === undefined) return true;
        if (typeof v === "string") return v.trim() === "";
        return false;
      })();

      if (!isEmptyValue) {
        delete next[k];
      }

      if (k === "waf" && v !== "lainnya") {
        delete next.waf_lainnya;
      }
      if (k === "va_pt_status" && v !== "ya") {
        delete next.va_pt_waktu;
      }

      // If user changes either PIC, clear the "both PIC empty" error state.
      if (k === "pic_internal" || k === "pic_eksternal") {
        delete next.pic_internal;
        delete next.pic_eksternal;
      }

      return next;
    });
  };

  const focusFirstInvalidField = (missingErrors, fieldOrder) => {
    const firstKey = (fieldOrder || []).find((x) => missingErrors?.[x]);
    if (!firstKey) return;

    setTimeout(() => {
      const target = document.querySelector(`[data-field="${firstKey}"]`);
      if (!target) return;

      try {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // ignore
      }

      if (typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    }, 0);
  };

  // Handler khusus untuk IP Address dengan auto-formatting
  const handleIpChange = (value) => {
    // Hanya izinkan angka, titik, dan karakter IPv6 (huruf a-f, A-F, titik dua)
    const cleanValue = value.replace(/[^0-9a-fA-F:.]/g, "");
    handleFormChange("alamat_ip_publik", cleanValue);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nama_aplikasi || formData.nama_aplikasi.trim() === "") {
      const missingErrors = { nama_aplikasi: true };
      setFieldErrors(missingErrors);
      focusFirstInvalidField(missingErrors, ["nama_aplikasi"]);
      showMessage("error", "Nama Aplikasi wajib diisi", 4500);
      return;
    }

    // Lakukan validasi terlebih dahulu
    if (!validateForm()) {
      return;
    }

    // Tampilkan modal konfirmasi
    setShowConfirmModal(true);
  };

  const validateForm = () => {
    try {
      // Require all fields to be filled
      const fieldLabels = {
        nama_aplikasi: "Nama Aplikasi",
        domain: "Domain",
        deskripsi_fungsi: "Deskripsi/Fungsi",
        user_pengguna: "User/Pengguna",
        data_digunakan: "Data yang Digunakan",
        luaran_output: "Luaran/Output",
        eselon1_id: "Eselon 1",
        eselon2_id: "Eselon 2 (opsional jika UPT diisi)",
        upt_id: "UPT (opsional jika Eselon 2 diisi)",
        cara_akses_id: "Cara Akses",
        frekuensi_pemakaian: "Frekuensi Pemakaian",
        status_aplikasi: "Status Aplikasi",
        pdn_id: "PDN Utama",
        pdn_backup: "PDN Backup",
        environment_id: "Environment",
        pic_internal: "PIC Internal",
        pic_eksternal: "PIC Eksternal",
        bahasa_pemrograman: "Bahasa Pemrograman",
        basis_data: "Basis Data",
        kerangka_pengembangan: "Kerangka Pengembangan",
        unit_pengembang: "Unit Pengembang",
        unit_operasional_teknologi: "Unit Operasional Teknologi",
        nilai_pengembangan_aplikasi: "Nilai Pengembangan Aplikasi",
        pusat_komputasi_utama: "Pusat Komputasi Utama",
        pusat_komputasi_backup: "Pusat Komputasi Backup",
        mandiri_komputasi_backup: "Mandiri Komputasi Backup",
        perangkat_lunak: "Perangkat Lunak",
        cloud: "Cloud",
        ssl: "SSL",
        ssl_expired: "Tanggal Expired SSL",
        alamat_ip_publik: "Alamat IP Publik",
        keterangan: "Keterangan",
        status_bmn: "Status BMN",
        server_aplikasi: "Server Aplikasi",
        tipe_lisensi_bahasa: "Tipe Lisensi Bahasa",
        api_internal_status: "API Internal",
        waf: "WAF",
        waf_lainnya: "WAF - Lainnya",
        va_pt_status: "VA/PT",
        va_pt_waktu: "VA/PT - Waktu",
        antivirus: "Antivirus",
      };

      // Tambahkan dynamic fields ke fieldLabels
      dynamicTables.forEach((table) => {
        const fieldName = `${table.table_name}_id`;
        fieldLabels[fieldName] = table.display_name;
      });

      const missing = [];
      const missingErrors = {};
      const fieldOrder = Object.keys(fieldLabels);
      for (const key of Object.keys(fieldLabels)) {
        const val = formData[key];
        // waf_lainnya only required when waf === 'lainnya'
        if (key === "waf_lainnya") continue;
        // va_pt_waktu only required when va_pt_status === 'ya'
        if (key === "va_pt_waktu") continue;
        // eselon2_id dan upt_id akan divalidasi terpisah dengan XOR logic
        if (key === "eselon2_id" || key === "upt_id") continue;
        // nilai_pengembangan_aplikasi is optional (not mandatory)
        if (key === "nilai_pengembangan_aplikasi") continue;

        // Special check for cara_akses_id (array)
        if (key === "cara_akses_id") {
          if (!Array.isArray(val) || val.length === 0) {
            missing.push(fieldLabels[key]);
            missingErrors[key] = true;
          }
          continue;
        }

        if (
          val === null ||
          val === undefined ||
          (typeof val === "string" && val.trim() === "")
        ) {
          missing.push(fieldLabels[key]);
          missingErrors[key] = true;
        }
      }

      // Validasi XOR: Minimal salah satu (Eselon 2 atau UPT) harus diisi
      const hasEselon2 =
        formData.eselon2_id && formData.eselon2_id.trim() !== "";
      const hasUpt = formData.upt_id && formData.upt_id.trim() !== "";

      if (!hasEselon2 && !hasUpt) {
        missing.push("Eselon 2 atau UPT (minimal salah satu)");
        missingErrors.eselon2_id = true;
        missingErrors.upt_id = true;
      }

      // Conditional checks
      if (formData.waf === "lainnya") {
        if (!formData.waf_lainnya || formData.waf_lainnya.trim() === "") {
          missing.push(fieldLabels["waf_lainnya"]);
          missingErrors.waf_lainnya = true;
        }
      }
      if (formData.va_pt_status === "ya") {
        if (!formData.va_pt_waktu || formData.va_pt_waktu.trim() === "") {
          missing.push(fieldLabels["va_pt_waktu"]);
          missingErrors.va_pt_waktu = true;
        }
      }

      // Validasi PIC: minimal salah satu harus ada
      const picInternalEmpty =
        !formData.pic_internal ||
        formData.pic_internal.trim() === "" ||
        formData.pic_internal === "Tidak Ada";
      const picEksternalEmpty =
        !formData.pic_eksternal ||
        formData.pic_eksternal.trim() === "" ||
        formData.pic_eksternal === "Tidak Ada";

      if (picInternalEmpty && picEksternalEmpty) {
        const picErrors = {
          ...missingErrors,
          pic_internal: true,
          pic_eksternal: true,
        };
        setFieldErrors(picErrors);
        focusFirstInvalidField(picErrors, [
          "pic_internal",
          "pic_eksternal",
          ...fieldOrder,
        ]);
        showMessage(
          "error",
          "Minimal salah satu PIC (Internal atau Eksternal) harus diisi dan tidak boleh 'Tidak Ada' untuk kedua-duanya.",
          7000,
        );
        return false;
      }

      // Validasi password dan konfirmasi_password (opsional, tapi jika diisi harus sama)
      if (
        formData.akses_aplikasi_password ||
        formData.akses_aplikasi_konfirmasi_password
      ) {
        if (
          formData.akses_aplikasi_password !==
          formData.akses_aplikasi_konfirmasi_password
        ) {
          const pwErrors = {
            ...missingErrors,
            akses_aplikasi_password: true,
            akses_aplikasi_konfirmasi_password: true,
          };
          setFieldErrors(pwErrors);
          showMessage(
            "error",
            "Password dan Konfirmasi Password tidak sama. Silakan periksa kembali.",
            6000,
          );
          return false;
        }
      }

      if (missing.length > 0) {
        setFieldErrors(missingErrors);
        focusFirstInvalidField(missingErrors, fieldOrder);
        showMessage(
          "error",
          "Field berikut wajib diisi:\n- " + missing.join("\n- "),
          6500,
        );
        return false;
      }

      // clear any previous validation errors
      if (Object.keys(fieldErrors || {}).length > 0) setFieldErrors({});

      // Additional client-side validation
      if (
        formData.alamat_ip_publik &&
        formData.alamat_ip_publik.trim() !== ""
      ) {
        const ipValue = formData.alamat_ip_publik.trim();

        // Validasi IPv4
        const ipv4Regex =
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        // Validasi IPv6 (format standar dan compressed)
        const ipv6Regex =
          /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

        const isValidIpv4 = ipv4Regex.test(ipValue);
        const isValidIpv6 = ipv6Regex.test(ipValue);

        if (!isValidIpv4 && !isValidIpv6) {
          showMessage(
            "error",
            "Alamat IP Publik tidak valid.\n\nFormat yang didukung:\n- IPv4: 192.168.1.1\n- IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            7000,
          );
          return false;
        }
      }
      if (
        formData.nilai_pengembangan_aplikasi &&
        formData.nilai_pengembangan_aplikasi.trim() !== ""
      ) {
        if (isNaN(Number(formData.nilai_pengembangan_aplikasi))) {
          showMessage(
            "error",
            "Nilai Pengembangan Aplikasi harus berupa angka",
            4500,
          );
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error("Validation error:", err);
      return false;
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);

    try {
      setSubmitting(true);

      const payload = {
        nama_aplikasi: formData.nama_aplikasi,
        domain: formData.domain || null,
        deskripsi_fungsi: formData.deskripsi_fungsi || null,
        user_pengguna: formData.user_pengguna || null,
        data_digunakan: formData.data_digunakan || null,
        luaran_output: formData.luaran_output || null,
        eselon1_id: formData.eselon1_id || null,
        eselon2_id: formData.eselon2_id || null,
        upt_id: formData.upt_id || null,
        cara_akses_id:
          formData.cara_akses_id && formData.cara_akses_id.length > 0
            ? formData.cara_akses_id[0]
            : null,
        cara_akses_multiple:
          formData.cara_akses_id && formData.cara_akses_id.length > 0
            ? JSON.stringify(formData.cara_akses_id)
            : null,
        frekuensi_pemakaian: formData.frekuensi_pemakaian || null,
        status_aplikasi: formData.status_aplikasi || null,
        pdn_id: formData.pdn_id || null,
        pdn_backup: formData.pdn_backup || null,
        environment_id: formData.environment_id || null,
        pic_internal: formData.pic_internal || null,
        pic_eksternal: formData.pic_eksternal || null,
        kontak_pic_internal: formData.kontak_pic_internal || null,
        kontak_pic_eksternal: formData.kontak_pic_eksternal || null,
        bahasa_pemrograman: formData.bahasa_pemrograman || null,
        basis_data: formData.basis_data || null,
        kerangka_pengembangan: formData.kerangka_pengembangan || null,
        unit_pengembang: formData.unit_pengembang || null,
        unit_operasional_teknologi: formData.unit_operasional_teknologi || null,
        nilai_pengembangan_aplikasi:
          formData.nilai_pengembangan_aplikasi || null,
        pusat_komputasi_utama: formData.pusat_komputasi_utama || null,
        pusat_komputasi_backup: formData.pusat_komputasi_backup || null,
        mandiri_komputasi_backup: formData.mandiri_komputasi_backup || null,
        perangkat_lunak: formData.perangkat_lunak || null,
        cloud: formData.cloud || null,
        ssl: formData.ssl || null,
        ssl_expired: formData.ssl_expired || null,
        alamat_ip_publik: formData.alamat_ip_publik || null,
        keterangan: formData.keterangan || null,
        status_bmn: formData.status_bmn || null,
        server_aplikasi: formData.server_aplikasi || null,
        tipe_lisensi_bahasa: formData.tipe_lisensi_bahasa || null,
        api_internal_status: formData.api_internal_status || null,
        waf:
          formData.waf === "lainnya"
            ? formData.waf_lainnya
            : formData.waf || null,
        antivirus: formData.antivirus || null,
        va_pt_status: formData.va_pt_status || null,
        va_pt_waktu:
          formData.va_pt_status === "ya" ? formData.va_pt_waktu : null,
        akses_aplikasi_username: formData.akses_aplikasi_username || null,
        akses_aplikasi_password: formData.akses_aplikasi_password || null,
      };

      // Add dynamic fields to payload
      dynamicTables.forEach((table) => {
        const fieldName = `${table.table_name}_id`;
        payload[fieldName] = formData[fieldName] || null;
      });

      const url = editMode
        ? `http://localhost:5000/api/aplikasi/${encodeURIComponent(originalAppName)}`
        : "http://localhost:5000/api/aplikasi";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        const serverMessage = result?.message;
        const serverError = result?.error;
        const combinedMessage = [serverMessage, serverError]
          .filter(Boolean)
          .join(" | ");
        const err = new Error(combinedMessage || "Gagal menyimpan aplikasi");
        err.status = res.status;
        err.payload = result;
        throw err;
      }
      // refresh list
      await fetchApps();
      setShowModal(false);
      showMessage(
        "success",
        editMode
          ? "Aplikasi berhasil diupdate"
          : "Aplikasi berhasil ditambahkan",
        3000,
      );
    } catch (err) {
      const status = err?.status;
      const payload = err?.payload;

      // Handle duplicate errors (nama aplikasi or domain)
      if (status === 400 && payload?.message) {
        // Backend returns specific error messages
        showMessage("error", payload.message, 5000);
      }
      // Handle other duplicate errors (fallback for 409 status)
      else if (status === 409) {
        showMessage(
          "error",
          payload?.message || "Data sudah terdaftar di database",
          5000,
        );
      } else {
        showMessage("error", "Error: " + (err?.message || err), 7000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="oe1-aplikasi-page"
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        .oe1-aplikasi-page input:not([type="checkbox"]):not([type="radio"]),
        .oe1-aplikasi-page select,
        .oe1-aplikasi-page textarea {
          background-color: #f8fafc !important;
        }

        .oe1-aplikasi-page input:not([type="checkbox"]):not([type="radio"]):focus,
        .oe1-aplikasi-page select:focus,
        .oe1-aplikasi-page textarea:focus {
          background-color: #f8fafc !important;
        }

        .oe1-aplikasi-page input:disabled:not([type="checkbox"]):not([type="radio"]),
        .oe1-aplikasi-page select:disabled,
        .oe1-aplikasi-page textarea:disabled {
          background-color: #f3f4f6 !important;
        }
      `}</style>
      {!!message?.text && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 10000,
            minWidth: 280,
            maxWidth: 520,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06)",
            background:
              message.type === "success"
                ? "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)"
                : message.type === "error"
                  ? "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)"
                  : "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  marginTop: 6,
                  backgroundColor:
                    message.type === "success"
                      ? "#10b981"
                      : message.type === "error"
                        ? "#ef4444"
                        : "#6366f1",
                }}
              />
              <div
                style={{
                  color: "#0f172a",
                  fontSize: 13,
                  lineHeight: 1.45,
                  whiteSpace: "pre-line",
                }}
              >
                {message.text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => showMessage("", "", 0)}
              aria-label="Tutup notifikasi"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: 2,
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 18 }}>×</span>
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
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
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              borderRadius: "12px",
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
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#fff" }}
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                marginBottom: "2px",
                fontSize: "18px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Data Aplikasi
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
              Kelola aplikasi milik unit Eselon 1 Anda
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={openModal}
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "12.5px",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(79, 70, 229, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(79, 70, 229, 0.3)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1V15M1 8H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Tambah Aplikasi</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "20px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Baris 1: Search + Filter Eselon 1 + Filter Status */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 20L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aplikasi, PIC, atau unit..."
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#1e293b",
                backgroundColor: "#fafbfc",
                outline: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(79, 70, 229, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.backgroundColor = "#fafbfc";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Info Eselon 1 (otomatis dari operator) - disabled select to match admin */}
          <select
            value={userEselon1Id || ""}
            disabled
            style={{
              padding: "9px 34px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#fafbfc",
              cursor: "not-allowed",
              outline: "none",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 8px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "18px",
              minWidth: "200px",
            }}
          >
            <option value="">{userNamaEselon1 || "-"}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 34px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#fafbfc",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 8px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "18px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              minWidth: "220px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#4f46e5";
              e.currentTarget.style.backgroundColor = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.backgroundColor = "#fafbfc";
            }}
          >
            <option value="all">Semua Status</option>
            {(master.status_aplikasi || []).map((s) => (
              <option
                key={s.status_aplikasi_id}
                value={(s.nama_status || "").toLowerCase()}
              >
                {s.nama_status}
              </option>
            ))}
          </select>
        </div>

        {/* Baris 2: Filter Eselon 2 + Filter UPT + Badge */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Filter Eselon 2 */}
          <select
            value={filterEselon2}
            onChange={(e) => {
              setFilterEselon2(e.target.value);
              if (e.target.value) {
                setFilterUpt(""); // Reset UPT when Eselon 2 is selected
              }
            }}
            disabled={!!filterUpt}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "9px 34px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: !!filterUpt ? "#f1f5f9" : "#fafbfc",
              cursor: !!filterUpt ? "not-allowed" : "pointer",
              opacity: !!filterUpt ? 0.6 : 1,
              outline: "none",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 8px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "18px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              if (!filterUpt) {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.backgroundColor = "#fff";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.backgroundColor = !!filterUpt
                ? "#f1f5f9"
                : "#fafbfc";
            }}
          >
            <option value="">
              {!!filterUpt ? "Eselon 2 (UPT dipilih)" : "Semua Eselon 2"}
            </option>
            {(master.eselon2 || [])
              .filter((e2) => {
                const aktif = e2.status_aktif === 1 || e2.status_aktif === true;
                if (!aktif) return false;
                if (!userEselon1Id) return true;
                return String(e2.eselon1_id) === String(userEselon1Id);
              })
              .map((e2) => (
                <option key={e2.eselon2_id} value={e2.eselon2_id}>
                  {e2.nama_eselon2}
                </option>
              ))}
          </select>

          {/* Filter UPT */}
          <select
            value={filterUpt}
            onChange={(e) => {
              setFilterUpt(e.target.value);
              if (e.target.value) {
                setFilterEselon2(""); // Reset Eselon 2 when UPT is selected
              }
            }}
            disabled={!!filterEselon2}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "9px 34px 9px 12px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: !!filterEselon2 ? "#f1f5f9" : "#fafbfc",
              cursor: !!filterEselon2 ? "not-allowed" : "pointer",
              opacity: !!filterEselon2 ? 0.6 : 1,
              outline: "none",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 8px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "18px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              if (!filterEselon2) {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.backgroundColor = "#fff";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.backgroundColor = !!filterEselon2
                ? "#f1f5f9"
                : "#fafbfc";
            }}
          >
            <option value="">
              {!!filterEselon2 ? "UPT (Eselon 2 dipilih)" : "Semua UPT"}
            </option>
            {(master.upt || [])
              .filter(
                (upt) =>
                  (upt.status_aktif === 1 || upt.status_aktif === true) &&
                  (!userEselon1Id ||
                    upt.eselon1_id === parseInt(userEselon1Id)),
              )
              .map((upt) => (
                <option key={upt.upt_id} value={upt.upt_id}>
                  {upt.nama_upt}
                </option>
              ))}
          </select>

          <div
            style={{
              padding: "7px 12px",
              background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
              borderRadius: "10px",
              fontSize: "11px",
              color: "#4f46e5",
              fontWeight: 700,
              border: "1.5px solid #c7d2fe",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: "#4f46e5",
                display: "inline-block",
              }}
            />
            <span>{filtered.length} Aplikasi</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            border: "1.5px solid #fca5a5",
            borderRadius: "10px",
            color: "#991b1b",
            marginBottom: "20px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#991b1b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              border: "3px solid #e0f2fe",
              borderTop: "3px solid #0ea5e9",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            Memuat data aplikasi...
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: "0 auto 16px", opacity: 0.3 }}
              >
                <path
                  d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Tidak ada data
              </div>
              <div style={{ fontSize: "13px" }}>
                {search || statusFilter !== "all"
                  ? "Tidak ada aplikasi yang sesuai dengan filter"
                  : "Belum ada aplikasi yang terdaftar"}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto", overflowY: "visible" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: "1200px",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
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
                    <th
                      style={{
                        width: "60px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        width: "250px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Aplikasi
                    </th>
                    <th
                      style={{
                        width: "220px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Unit
                    </th>
                    <th
                      style={{
                        width: "150px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      PIC
                    </th>
                    <th
                      style={{
                        width: "140px",
                        padding: "8px 10px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <button
                          onClick={() => handleSort("status")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: 0,
                            fontWeight: 600,
                            fontSize: "11px",
                            color: sortColumn === "status" ? "#4f46e5" : "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            transition: "color 0.2s ease",
                          }}
                          onMouseOver={(e) => {
                            if (sortColumn !== "status") {
                              e.currentTarget.style.color = "#1e293b";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (sortColumn !== "status") {
                              e.currentTarget.style.color = "#475569";
                            }
                          }}
                        >
                          <span>Status Aplikasi</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              opacity: sortColumn === "status" ? 1 : 0.6,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            {sortColumn === "status" && sortDirection === "asc" ? (
                              <path
                                d="M12 4L6 10H18L12 4Z"
                                fill="currentColor"
                              />
                            ) : sortColumn === "status" && sortDirection === "desc" ? (
                              <path
                                d="M12 20L18 14H6L12 20Z"
                                fill="currentColor"
                              />
                            ) : (
                              <>
                                <path
                                  d="M12 4L6 10H18L12 4Z"
                                  fill="currentColor"
                                  opacity="0.6"
                                />
                                <path
                                  d="M12 20L18 14H6L12 20Z"
                                  fill="currentColor"
                                  opacity="0.6"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </th>
                    <th
                      style={{
                        width: "160px",
                        padding: "8px 10px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <button
                          onClick={() => handleSort("ssl_expired")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: 0,
                            fontWeight: 600,
                            fontSize: "11px",
                            color: sortColumn === "ssl_expired" ? "#4f46e5" : "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            transition: "color 0.2s ease",
                          }}
                          onMouseOver={(e) => {
                            if (sortColumn !== "ssl_expired") {
                              e.currentTarget.style.color = "#1e293b";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (sortColumn !== "ssl_expired") {
                              e.currentTarget.style.color = "#475569";
                            }
                          }}
                        >
                          <span>Expired SSL</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              opacity: sortColumn === "ssl_expired" ? 1 : 0.6,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            {sortColumn === "ssl_expired" && sortDirection === "asc" ? (
                              <path
                                d="M12 4L6 10H18L12 4Z"
                                fill="currentColor"
                              />
                            ) : sortColumn === "ssl_expired" && sortDirection === "desc" ? (
                              <path
                                d="M12 20L18 14H6L12 20Z"
                                fill="currentColor"
                              />
                            ) : (
                              <>
                                <path
                                  d="M12 4L6 10H18L12 4Z"
                                  fill="currentColor"
                                  opacity="0.6"
                                />
                                <path
                                  d="M12 20L18 14H6L12 20Z"
                                  fill="currentColor"
                                  opacity="0.6"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </th>
                    <th
                      style={{
                        width: "130px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status SSL
                    </th>
                    <th
                      style={{
                        width: "100px",
                        padding: "12px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApps.map((app, i) => {
                    const badge = getStatusBadge(app);
                    const unit = app.nama_eselon1 || app.nama_eselon2 || "-";

                    // Prioritas PIC Internal, jika tidak ada maka PIC Eksternal
                    let pic = "-";
                    if (
                      app.nama_pic_internal &&
                      app.nama_pic_internal !== "Tidak Ada"
                    ) {
                      pic = app.nama_pic_internal;
                    } else if (
                      app.nama_pic_eksternal &&
                      app.nama_pic_eksternal !== "Tidak Ada"
                    ) {
                      pic = app.nama_pic_eksternal;
                    }

                    return (
                      <tr
                        key={app.nama_aplikasi ?? i}
                        onClick={() => {
                          setSelectedApp(app);
                          setShowDetailModal(true);
                        }}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.15s ease",
                          height: "70px",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: "#64748b",
                            verticalAlign: "middle",
                          }}
                        >
                          {startIndex + i + 1}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#0f172a",
                              fontSize: "12px",
                              marginBottom: "2px",
                              wordWrap: "break-word",
                              lineHeight: "1.3",
                            }}
                          >
                            {app.nama_aplikasi || "-"}
                          </div>
                          {app.domain && (
                            <a
                              className="allow-lowercase"
                              href={
                                app.domain.startsWith("http")
                                  ? app.domain
                                  : `https://${app.domain}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "11px",
                                color: "#2563eb",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "2px",
                                textTransform: "none",
                                wordBreak: "break-all",
                                lineHeight: "1.3",
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4061 4.45794 20.4791 3.53091C19.5521 2.60389 18.298 2.07802 16.987 2.06663C15.676 2.05523 14.413 2.55921 13.47 3.47L11.75 5.18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14 11C13.5705 10.4259 13.0226 9.95084 12.3934 9.60707C11.7642 9.26331 11.0685 9.05889 10.3534 9.00768C9.63822 8.95646 8.92043 9.05964 8.24866 9.31024C7.57689 9.56084 6.96689 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59385 19.5421 3.52087 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span
                                className="allow-lowercase"
                                style={{ textTransform: "none" }}
                              >
                                {app.domain}
                              </span>
                            </a>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            color: "#64748b",
                            fontSize: "12px",
                            verticalAlign: "middle",
                            wordWrap: "break-word",
                            lineHeight: "1.3",
                          }}
                        >
                          {unit}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            color: "#64748b",
                            fontSize: "12px",
                            verticalAlign: "middle",
                            wordWrap: "break-word",
                            lineHeight: "1.3",
                          }}
                        >
                          {pic}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 8px",
                                borderRadius: "10px",
                                backgroundColor: badge.bg,
                                color: badge.color,
                                fontWeight: 700,
                                fontSize: "10px",
                                letterSpacing: "0.01em",
                                textTransform: "uppercase",
                              }}
                            >
                              <span
                                style={{
                                  width: "4px",
                                  height: "4px",
                                  borderRadius: "50%",
                                  backgroundColor: badge.color,
                                  display: "inline-block",
                                }}
                              />
                              {badge.label}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 500,
                            verticalAlign: "middle",
                            lineHeight: "1.3",
                          }}
                        >
                          {app.ssl_expired
                            ? new Date(app.ssl_expired).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            verticalAlign: "middle",
                          }}
                        >
                          {(() => {
                            if (!app.ssl_expired)
                              return (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    backgroundColor: "#f1f5f9",
                                    color: "#64748b",
                                    fontWeight: 700,
                                    fontSize: "10px",
                                    letterSpacing: "0.01em",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "4px",
                                      height: "4px",
                                      borderRadius: "50%",
                                      backgroundColor: "#64748b",
                                      display: "inline-block",
                                    }}
                                  />
                                  -
                                </span>
                              );

                            const today = new Date();
                            const expiredDate = new Date(app.ssl_expired);
                            const isExpired = expiredDate < today;

                            return (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: isExpired
                                    ? "#fee2e2"
                                    : "#d1fae5",
                                  color: isExpired ? "#dc2626" : "#059669",
                                  fontWeight: 700,
                                  fontSize: "10px",
                                  letterSpacing: "0.01em",
                                  textTransform: "uppercase",
                                }}
                              >
                                <span
                                  style={{
                                    width: "4px",
                                    height: "4px",
                                    borderRadius: "50%",
                                    backgroundColor: isExpired
                                      ? "#dc2626"
                                      : "#059669",
                                    display: "inline-block",
                                  }}
                                />
                                {isExpired ? "Non Aktif" : "Aktif"}
                              </span>
                            );
                          })()}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(app.nama_aplikasi);
                            }}
                            title="Edit"
                            style={{
                              padding: "5px 10px",
                              background:
                                "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#fff",
                              transition: "all 0.2s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: "0 2px 6px rgba(245, 158, 11, 0.25)",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(245, 158, 11, 0.35)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 6px rgba(245, 158, 11, 0.25)";
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              background: currentPage === 1 ? "#f1f5f9" : "#fff",
              color: currentPage === 1 ? "#94a3b8" : "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sebelumnya
          </button>

          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const isFirstOrLast = page === 1 || page === totalPages;
              const isNearCurrent = Math.abs(page - currentPage) <= 1;
              const showEllipsis =
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 &&
                  currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span
                    key={page}
                    style={{
                      padding: "8px 12px",
                      color: "#94a3b8",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    ...
                  </span>
                );
              }

              if (!isFirstOrLast && !isNearCurrent) {
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid",
                    borderColor:
                      currentPage === page ? "#6366f1" : "#cbd5e1",
                    background:
                      currentPage === page
                        ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                        : "#fff",
                    color: currentPage === page ? "#fff" : "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minWidth: "40px",
                  }}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              background: currentPage === totalPages ? "#f1f5f9" : "#fff",
              color: currentPage === totalPages ? "#94a3b8" : "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Selanjutnya
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {!loading && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          Menampilkan {shownCount} dari {filtered.length} aplikasi
        </div>
      )}

      {/* Modal for input/edit */}
      {showModal && (
        <div
          className="oe1-aplikasi-modal"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            animation: "fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <style>{`
            .oe1-aplikasi-modal input:not([type="checkbox"]):not([type="radio"]),
            .oe1-aplikasi-modal select,
            .oe1-aplikasi-modal textarea {
              background-color: #f8fafc !important;
              border-radius: 10px !important;
              border-width: 1.5px !important;
              border-style: solid !important;
              padding: 10px 12px !important;
              font-size: 14px !important;
            }

            .oe1-aplikasi-modal input:not([type="checkbox"]):not([type="radio"]):focus,
            .oe1-aplikasi-modal select:focus,
            .oe1-aplikasi-modal textarea:focus {
              border-color: #6366f1 !important;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08) !important;
            }

            .oe1-aplikasi-modal input:disabled:not([type="checkbox"]):not([type="radio"]),
            .oe1-aplikasi-modal select:disabled,
            .oe1-aplikasi-modal textarea:disabled {
              background-color: #f3f4f6 !important;
            }
          `}</style>
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                padding: "20px 28px",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                  }}
                >
                  {editMode ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: "#fff" }}
                    >
                      <path
                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: "#fff" }}
                    >
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {editMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#f8fafc",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div
              style={{
                overflowY: "auto",
                flex: 1,
              }}
            >
              <form onSubmit={handleSubmitForm} style={{ padding: "32px" }}>
                {/* Informasi Dasar */}
                <div
                  style={{
                    marginBottom: "32px",
                    paddingBottom: "28px",
                    borderBottom: "1px solid #cbd5e1",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      marginBottom: "20px",
                      marginTop: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Informasi Dasar
                  </h3>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: 600,
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Nama Aplikasi <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      data-field="nama_aplikasi"
                      value={formData.nama_aplikasi}
                      onChange={(e) =>
                        handleFormChange("nama_aplikasi", e.target.value)
                      }
                      placeholder="Contoh: Sistem Informasi Kepegawaian"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        borderColor: fieldErrors.nama_aplikasi
                          ? errorBorderColor
                          : "#e2e8f0",
                        fontSize: "13px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        backgroundColor: "#fafbfc",
                        boxShadow: fieldErrors.nama_aplikasi
                          ? errorRing
                          : "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          fieldErrors.nama_aplikasi
                            ? errorBorderColor
                            : "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#fafbfc";
                        e.currentTarget.style.boxShadow =
                          fieldErrors.nama_aplikasi ? errorRing : "none";
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: 600,
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Deskripsi dan Fungsi <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      data-field="deskripsi_fungsi"
                      value={formData.deskripsi_fungsi}
                      onChange={(e) =>
                        handleFormChange("deskripsi_fungsi", e.target.value)
                      }
                      placeholder="Contoh: Aplikasi untuk mengelola data pegawai, absensi, dan penggajian"
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        borderColor: fieldErrors.deskripsi_fungsi
                          ? errorBorderColor
                          : "#e2e8f0",
                        fontSize: "13px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        fontFamily: "inherit",
                        resize: "vertical",
                        backgroundColor: "#fafbfc",
                        lineHeight: "1.6",
                        boxShadow: fieldErrors.deskripsi_fungsi
                          ? errorRing
                          : "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          fieldErrors.deskripsi_fungsi
                            ? errorBorderColor
                            : "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#fafbfc";
                        e.currentTarget.style.boxShadow =
                          fieldErrors.deskripsi_fungsi ? errorRing : "none";
                      }}
                    />
                  </div>
                </div>

                {/* Lokasi & Penggunaan */}
                <div
                  style={{
                    marginBottom: "32px",
                    paddingBottom: "28px",
                    borderBottom: "1px solid #cbd5e1",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      marginBottom: "20px",
                      marginTop: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Lokasi & Penggunaan
                  </h3>

                  {/* Eselon 1 dan Eselon 2 - 2 kolom untuk lebih rapi */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "16px",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Eselon 1
                      </label>
                      <select
                        data-field="eselon1_id"
                        value={formData.eselon1_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleFormChange("eselon1_id", val);
                          handleFormChange("eselon2_id", "");
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.eselon1_id
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#f8fafc",
                          boxShadow: fieldErrors.eselon1_id ? errorRing : "none",
                        }}
                        disabled
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#6366f1";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(99, 102, 241, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.eselon1_id
                            ? errorBorderColor
                            : "#cbd5e1";
                          e.currentTarget.style.boxShadow = fieldErrors.eselon1_id
                            ? errorRing
                            : "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {formData.eselon1_id &&
                          userNamaEselon1 &&
                          !(master.eselon1 || []).some(
                            (x) =>
                              String(x?.eselon1_id) ===
                              String(formData.eselon1_id),
                          ) && (
                            <option value={String(formData.eselon1_id)}>
                              {userNamaEselon1}
                            </option>
                          )}
                        {(master.eselon1 || [])
                          .filter((x) => isActiveFlag(x.status_aktif))
                          .map((x) => (
                            <option
                              key={String(x.eselon1_id)}
                              value={String(x.eselon1_id)}
                            >
                              {x.nama_eselon1}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Eselon 2{" "}
                        <span
                          style={{
                            color: "#94a3b8",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        >
                          (opsional jika UPT diisi)
                        </span>
                      </label>
                      <select
                        data-field="eselon2_id"
                        value={formData.eselon2_id}
                        onChange={(e) =>
                          handleFormChange("eselon2_id", e.target.value)
                        }
                        disabled={!!formData.upt_id}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.eselon2_id
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: formData.upt_id ? "not-allowed" : "pointer",
                          backgroundColor: "#f8fafc",
                          opacity: formData.upt_id ? 0.6 : 1,
                          boxShadow: fieldErrors.eselon2_id ? errorRing : "none",
                        }}
                        onFocus={(e) => {
                          if (!formData.upt_id) {
                            e.currentTarget.style.borderColor = "#6366f1";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(99, 102, 241, 0.08)";
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.eselon2_id
                            ? errorBorderColor
                            : "#cbd5e1";
                          e.currentTarget.style.boxShadow = fieldErrors.eselon2_id
                            ? errorRing
                            : "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.eselon2 || [])
                          .filter(
                            (x) =>
                              isActiveFlag(x.status_aktif) &&
                              (!formData.eselon1_id ||
                                String(x.eselon1_id) ===
                                String(formData.eselon1_id)),
                          )
                          .map((x) => (
                            <option key={x.eselon2_id} value={x.eselon2_id}>
                              {x.nama_eselon2}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* UPT - Full width untuk lebih jelas */}
                  <div style={{ marginBottom: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        UPT{" "}
                        <span
                          style={{
                            color: "#94a3b8",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        >
                          (opsional jika Eselon 2 diisi)
                        </span>
                      </label>
                      <select
                        data-field="upt_id"
                        value={formData.upt_id}
                        onChange={(e) =>
                          handleFormChange("upt_id", e.target.value)
                        }
                        disabled={!!formData.eselon2_id}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.upt_id
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: formData.eselon2_id
                            ? "not-allowed"
                            : "pointer",
                          backgroundColor: "#f8fafc",
                          opacity: formData.eselon2_id ? 0.6 : 1,
                          boxShadow: fieldErrors.upt_id ? errorRing : "none",
                        }}
                        onFocus={(e) => {
                          if (!formData.eselon2_id) {
                            e.currentTarget.style.borderColor = "#6366f1";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(99, 102, 241, 0.08)";
                          }
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.upt_id
                            ? errorBorderColor
                            : "#cbd5e1";
                          e.currentTarget.style.boxShadow = fieldErrors.upt_id
                            ? errorRing
                            : "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.upt || [])
                          .filter(
                            (x) =>
                              isActiveFlag(x.status_aktif) &&
                              (!formData.eselon1_id ||
                                String(x.eselon1_id) ===
                                String(formData.eselon1_id)),
                          )
                          .map((x) => (
                            <option key={x.upt_id} value={x.upt_id}>
                              {x.nama_upt}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "10px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Cara Akses Aplikasi <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="cara_akses_id"
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          backgroundColor: "#fafbfc",
                          borderColor: fieldErrors.cara_akses_id
                            ? errorBorderColor
                            : "#cbd5e1",
                          boxShadow: fieldErrors.cara_akses_id
                            ? errorRing
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridAutoFlow: "column",
                            gridAutoColumns: "max-content",
                            gridTemplateRows: "repeat(2, auto)",
                            gap: "8px",
                            overflowX: "auto",
                          }}
                        >
                          {(() => {
                            const options = (master.cara_akses || []).filter(
                              (x) => isActiveFlag(x.status_aktif),
                            );

                            const cols = Math.ceil(options.length / 2) || 1;
                            const row1 = options.slice(0, cols);
                            const row2 = options.slice(cols);
                            const interleaved = [];
                            for (let i = 0; i < cols; i += 1) {
                              if (row1[i]) interleaved.push(row1[i]);
                              if (row2[i]) interleaved.push(row2[i]);
                            }

                            return interleaved;
                          })().map((x) => (
                            <label
                              key={x.cara_akses_id}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                padding: "8px 10px",
                                cursor: "pointer",
                                borderRadius: "6px",
                                backgroundColor: (
                                  formData.cara_akses_id || []
                                ).includes(String(x.cara_akses_id))
                                  ? "#e0f2fe"
                                  : "#fff",
                                border: (formData.cara_akses_id || []).includes(
                                  String(x.cara_akses_id),
                                )
                                  ? "1px solid #0ea5e9"
                                  : "1px solid #cbd5e1",
                                transition: "all 0.15s",
                                minHeight: "38px",
                              }}
                              onMouseEnter={(e) => {
                                if (
                                  !(formData.cara_akses_id || []).includes(
                                    String(x.cara_akses_id),
                                  )
                                ) {
                                  e.currentTarget.style.backgroundColor =
                                    "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#cbd5e1";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (
                                  !(formData.cara_akses_id || []).includes(
                                    String(x.cara_akses_id),
                                  )
                                ) {
                                  e.currentTarget.style.backgroundColor = "#fff";
                                  e.currentTarget.style.borderColor = "#cbd5e1";
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  formData.cara_akses_id || []
                                ).includes(String(x.cara_akses_id))}
                                onChange={(e) => {
                                  const id = String(x.cara_akses_id);
                                  const current = formData.cara_akses_id || [];
                                  const updated = e.target.checked
                                    ? [...current, id]
                                    : current.filter((item) => item !== id);
                                  handleFormChange("cara_akses_id", updated);
                                }}
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginRight: "10px",
                                  marginTop: "1px",
                                  cursor: "pointer",
                                  accentColor: "#0ea5e9",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "13px",
                                  color: "#334155",
                                  fontWeight: 500,
                                  lineHeight: "1.4",
                                  wordBreak: "break-word",
                                  flex: 1,
                                }}
                              >
                                {x.nama_cara_akses}
                              </span>
                            </label>
                          ))}
                        </div>
                        {(!master.cara_akses ||
                          (master.cara_akses || []).filter((x) =>
                            isActiveFlag(x.status_aktif),
                          ).length === 0) && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#94a3b8",
                                textAlign: "center",
                                padding: "20px",
                              }}
                            >
                              Tidak ada data Cara Akses
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Teknis */}
                <div
                  style={{
                    marginBottom: "32px",
                    paddingBottom: "28px",
                    borderBottom: "1px solid #cbd5e1",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      marginBottom: "20px",
                      marginTop: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
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
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6" />
                    </svg>
                    Detail Teknis
                  </h3>

                  {/* Frekuensi dan Status - 2 kolom */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "16px",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Frekuensi Pemakaian <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="frekuensi_pemakaian"
                        value={formData.frekuensi_pemakaian}
                        onChange={(e) =>
                          handleFormChange(
                            "frekuensi_pemakaian",
                            e.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.frekuensi_pemakaian
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#6366f1";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(99, 102, 241, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            fieldErrors.frekuensi_pemakaian
                              ? errorBorderColor
                              : "#cbd5e1";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.frekuensi_pemakaian || [])
                          .filter((x) => isActiveFlag(x.status_aktif))
                          .map((x) => (
                            <option
                              key={x.frekuensi_pemakaian}
                              value={x.frekuensi_pemakaian}
                            >
                              {x.nama_frekuensi}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Status Aplikasi <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="status_aplikasi"
                        value={formData.status_aplikasi}
                        onChange={(e) =>
                          handleFormChange("status_aplikasi", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.status_aplikasi
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#6366f1";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(99, 102, 241, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            fieldErrors.status_aplikasi
                              ? errorBorderColor
                              : "#cbd5e1";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.status_aplikasi || [])
                          .filter((x) => isActiveFlag(x.status_aktif))
                          .map((x) => (
                            <option
                              key={x.status_aplikasi_id}
                              value={x.status_aplikasi_id}
                            >
                              {x.nama_status}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Ekosistem - Full width untuk lebih prominent */}
                  <div style={{ marginBottom: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Ekosistem <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="environment_id"
                        value={formData.environment_id}
                        onChange={(e) =>
                          handleFormChange("environment_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.environment_id
                            ? errorBorderColor
                            : "#cbd5e1",
                          fontSize: "14px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#6366f1";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(99, 102, 241, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            fieldErrors.environment_id
                              ? errorBorderColor
                              : "#cbd5e1";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.environment || [])
                          .filter((x) => isActiveFlag(x.status_aktif))
                          .map((x) => (
                            <option
                              key={x.environment_id}
                              value={x.environment_id}
                            >
                              {x.jenis_environment}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        PDN Utama <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="pdn_id"
                        value={formData.pdn_id}
                        onChange={(e) =>
                          handleFormChange("pdn_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pdn_id
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pdn_id
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.pdn || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
                          )
                          .map((x) => (
                            <option key={x.pdn_id} value={x.pdn_id}>
                              {x.kode_pdn}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        PDN Backup <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="pdn_backup"
                        value={formData.pdn_backup}
                        onChange={(e) =>
                          handleFormChange("pdn_backup", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pdn_backup
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pdn_backup
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-- Pilih PDN Backup --</option>
                        {(master.pdn || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
                          )
                          .map((x) => (
                            <option key={x.pdn_id} value={x.kode_pdn}>
                              {x.kode_pdn}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        PIC Internal <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="pic_internal"
                        value={formData.pic_internal}
                        onChange={(e) =>
                          handleFormChange("pic_internal", e.target.value)
                        }
                        disabled={
                          !formData.eselon1_id ||
                          (!formData.eselon2_id && !formData.upt_id)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pic_internal
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pic_internal
                            ? errorBoxShadow
                            : "none",
                          backgroundColor:
                            !formData.eselon1_id ||
                              (!formData.eselon2_id && !formData.upt_id)
                              ? "#f3f4f6"
                              : "#fff",
                          cursor:
                            !formData.eselon1_id ||
                              (!formData.eselon2_id && !formData.upt_id)
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <option value="">
                          {!formData.eselon1_id ||
                            (!formData.eselon2_id && !formData.upt_id)
                            ? "Pilih Eselon 1 & (Eselon 2 atau UPT) terlebih dahulu"
                            : "-Pilih-"}
                        </option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_internal || [])
                          .filter(
                            (x) =>
                              (x.status_aktif === 1 ||
                                x.status_aktif === true) &&
                              (formData.eselon2_id
                                ? String(x.eselon2_id) ===
                                String(formData.eselon2_id)
                                : formData.upt_id
                                  ? String(x.upt_id) === String(formData.upt_id)
                                  : true),
                          )
                          .map((x) => (
                            <option
                              key={x.pic_internal_id}
                              value={x.nama_pic_internal}
                            >
                              {x.nama_pic_internal}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        PIC Eksternal <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="pic_eksternal"
                        value={formData.pic_eksternal}
                        onChange={(e) =>
                          handleFormChange("pic_eksternal", e.target.value)
                        }
                        disabled={
                          !formData.eselon1_id ||
                          (!formData.eselon2_id && !formData.upt_id)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pic_eksternal
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pic_eksternal
                            ? errorBoxShadow
                            : "none",
                          backgroundColor:
                            !formData.eselon1_id ||
                              (!formData.eselon2_id && !formData.upt_id)
                              ? "#f3f4f6"
                              : "#fff",
                          cursor:
                            !formData.eselon1_id ||
                              (!formData.eselon2_id && !formData.upt_id)
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <option value="">
                          {!formData.eselon1_id ||
                            (!formData.eselon2_id && !formData.upt_id)
                            ? "Pilih Eselon 1 & (Eselon 2 atau UPT) terlebih dahulu"
                            : "-Pilih-"}
                        </option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_eksternal || [])
                          .filter(
                            (x) =>
                              (x.status_aktif === 1 ||
                                x.status_aktif === true) &&
                              (formData.eselon2_id
                                ? String(x.eselon2_id) ===
                                String(formData.eselon2_id)
                                : formData.upt_id
                                  ? String(x.upt_id) === String(formData.upt_id)
                                  : true),
                          )
                          .map((x) => (
                            <option
                              key={x.pic_eksternal_id}
                              value={x.nama_pic_eksternal}
                            >
                              {x.nama_pic_eksternal}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Kontak PIC Fields */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Kontak PIC Internal <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="kontak_pic_internal"
                        type="tel"
                        value={formData.kontak_pic_internal}
                        readOnly
                        disabled
                        placeholder="Otomatis terisi dari master PIC"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          backgroundColor: "#f3f4f6",
                          cursor: "not-allowed",
                          color: "#6b7280",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Kontak PIC Eksternal <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="kontak_pic_eksternal"
                        type="tel"
                        value={formData.kontak_pic_eksternal}
                        readOnly
                        disabled
                        placeholder="Otomatis terisi dari master PIC"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          backgroundColor: "#f3f4f6",
                          cursor: "not-allowed",
                          color: "#6b7280",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: "13px",
                      }}
                    >
                      Domain <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      data-field="domain"
                      value={formData.domain}
                      onChange={(e) =>
                        handleFormChange("domain", e.target.value)
                      }
                      placeholder="https://contoh.domain"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #e6eef6",
                        borderColor: fieldErrors.domain
                          ? errorBorderColor
                          : "#e6eef6",
                        boxShadow: fieldErrors.domain ? errorBoxShadow : "none",
                        textTransform: "none",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: "13px",
                      }}
                    >
                      User / Pengguna <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div
                      data-field="user_pengguna"
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1.5px solid",
                        borderColor: fieldErrors.user_pengguna
                          ? errorBorderColor
                          : "#cbd5e1",
                        backgroundColor: "#f8fafc",
                        boxShadow: fieldErrors.user_pengguna
                          ? errorBoxShadow
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {USER_PENGGUNA_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: userPenggunaSelected.includes(option.value) ? "#eff6ff" : "#fafbfc",
                              border: userPenggunaSelected.includes(option.value) ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (!userPenggunaSelected.includes(option.value)) {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = userPenggunaSelected.includes(option.value) ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = userPenggunaSelected.includes(option.value) ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={userPenggunaSelected.includes(
                                option.value,
                              )}
                              onChange={(e) => {
                                const value = option.value;
                                const updated = e.target.checked
                                  ? [...userPenggunaSelected, value]
                                  : userPenggunaSelected.filter(
                                    (v) => v !== value,
                                  );
                                setUserPenggunaSelected(updated);

                                // Build final string
                                const finalString = buildUserPenggunaString(
                                  updated,
                                  userPenggunaLainnya,
                                );
                                handleFormChange("user_pengguna", finalString);
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: userPenggunaSelected.includes(option.value) ? "#4338ca" : "#334155",
                                fontWeight: userPenggunaSelected.includes(option.value) ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {userPenggunaSelected.includes("lainnya") && (
                        <div style={{ marginTop: "10px" }}>
                          <input
                            type="text"
                            value={userPenggunaLainnya}
                            onChange={(e) => {
                              const text = e.target.value;
                              setUserPenggunaLainnya(text);

                              // Build final string
                              const finalString = buildUserPenggunaString(
                                userPenggunaSelected,
                                text,
                              );
                              handleFormChange("user_pengguna", finalString);
                            }}
                            placeholder="Sebutkan lainnya..."
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              outline: "none",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: "13px",
                      }}
                    >
                      Data Yang Digunakan <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      data-field="data_digunakan"
                      value={formData.data_digunakan}
                      onChange={(e) =>
                        handleFormChange("data_digunakan", e.target.value)
                      }
                      placeholder="Contoh: Data pegawai, data absensi, data penggajian"
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #e6eef6",
                        borderColor: fieldErrors.data_digunakan
                          ? errorBorderColor
                          : "#e6eef6",
                        boxShadow: fieldErrors.data_digunakan
                          ? errorBoxShadow
                          : "none",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: "13px",
                      }}
                    >
                      Luaran/Output <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      data-field="luaran_output"
                      value={formData.luaran_output}
                      onChange={(e) =>
                        handleFormChange("luaran_output", e.target.value)
                      }
                      placeholder="Contoh: Laporan absensi bulanan, slip gaji, rekapitulasi kinerja"
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #e6eef6",
                        borderColor: fieldErrors.luaran_output
                          ? errorBorderColor
                          : "#e6eef6",
                        boxShadow: fieldErrors.luaran_output
                          ? errorBoxShadow
                          : "none",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Bahasa Pemrograman <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="bahasa_pemrograman"
                        value={formData.bahasa_pemrograman}
                        onChange={(e) =>
                          handleFormChange("bahasa_pemrograman", e.target.value)
                        }
                        placeholder="Contoh: PHP, Python, Java"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.bahasa_pemrograman
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.bahasa_pemrograman
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Basis Data <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="basis_data"
                        value={formData.basis_data}
                        onChange={(e) =>
                          handleFormChange("basis_data", e.target.value)
                        }
                        placeholder="Contoh: MySQL, PostgreSQL, Oracle"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.basis_data
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.basis_data
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Framework - Full width */}
                  <div style={{ marginTop: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Kerangka Pengembangan / Framework <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="kerangka_pengembangan"
                        value={formData.kerangka_pengembangan}
                        onChange={(e) =>
                          handleFormChange(
                            "kerangka_pengembangan",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Laravel, Django, Spring Boot"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.kerangka_pengembangan
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.kerangka_pengembangan
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Unit Pengembang - Full width */}
                  <div style={{ marginTop: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Unit Pengembang <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="unit_pengembang"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.unit_pengembang
                            ? errorBorderColor
                            : "#cbd5e1",
                          backgroundColor: "#f8fafc",
                          boxShadow: fieldErrors.unit_pengembang
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: unitPengembangType === "sekretariat_eselon_1" ? "#eff6ff" : "#fafbfc",
                              border: unitPengembangType === "sekretariat_eselon_1" ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (unitPengembangType !== "sekretariat_eselon_1") {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = unitPengembangType === "sekretariat_eselon_1" ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = unitPengembangType === "sekretariat_eselon_1" ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="radio"
                              name="unit_pengembang"
                              checked={
                                unitPengembangType === "sekretariat_eselon_1"
                              }
                              onChange={() => {
                                setUnitPengembangType("sekretariat_eselon_1");
                                setUnitPengembangEksternal("");
                                handleFormChange(
                                  "unit_pengembang",
                                  "Sekretariat Eselon 1",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: unitPengembangType === "sekretariat_eselon_1" ? "#4338ca" : "#334155",
                                fontWeight: unitPengembangType === "sekretariat_eselon_1" ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              Sekretariat Eselon 1
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: unitPengembangType === "internal_eselon_2" ? "#eff6ff" : "#fafbfc",
                              border: unitPengembangType === "internal_eselon_2" ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (unitPengembangType !== "internal_eselon_2") {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = unitPengembangType === "internal_eselon_2" ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = unitPengembangType === "internal_eselon_2" ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="radio"
                              name="unit_pengembang"
                              checked={
                                unitPengembangType === "internal_eselon_2"
                              }
                              onChange={() => {
                                setUnitPengembangType("internal_eselon_2");
                                setUnitPengembangEksternal("");
                                handleFormChange(
                                  "unit_pengembang",
                                  "Internal Eselon 2",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: unitPengembangType === "internal_eselon_2" ? "#4338ca" : "#334155",
                                fontWeight: unitPengembangType === "internal_eselon_2" ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              Internal Eselon 2
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: unitPengembangType === "eksternal" ? "#eff6ff" : "#fafbfc",
                              border: unitPengembangType === "eksternal" ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (unitPengembangType !== "eksternal") {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = unitPengembangType === "eksternal" ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = unitPengembangType === "eksternal" ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="radio"
                              name="unit_pengembang"
                              checked={unitPengembangType === "eksternal"}
                              onChange={() => {
                                setUnitPengembangType("eksternal");
                                handleFormChange(
                                  "unit_pengembang",
                                  unitPengembangEksternal,
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: unitPengembangType === "eksternal" ? "#4338ca" : "#334155",
                                fontWeight: unitPengembangType === "eksternal" ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              Eksternal (Lainnya)
                            </span>
                          </label>

                          {unitPengembangType === "eksternal" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={unitPengembangEksternal}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setUnitPengembangEksternal(text);
                                  handleFormChange("unit_pengembang", text);
                                }}
                                placeholder="Sebutkan nama eksternal..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unit Operasional Teknologi - Full width */}
                  <div style={{ marginTop: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Unit Operasional Teknologi <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="unit_operasional_teknologi"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "10px",
                          border: "1.5px solid",
                          borderColor: fieldErrors.unit_operasional_teknologi
                            ? errorBorderColor
                            : "#cbd5e1",
                          backgroundColor: "#f8fafc",
                          boxShadow: fieldErrors.unit_operasional_teknologi
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: unitOperasionalTeknologiType === "pusdatin" ? "#eff6ff" : "#fafbfc",
                              border: unitOperasionalTeknologiType === "pusdatin" ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (unitOperasionalTeknologiType !== "pusdatin") {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = unitOperasionalTeknologiType === "pusdatin" ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = unitOperasionalTeknologiType === "pusdatin" ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="radio"
                              name="unit_operasional_teknologi"
                              checked={
                                unitOperasionalTeknologiType === "pusdatin"
                              }
                              onChange={() => {
                                setUnitOperasionalTeknologiType("pusdatin");
                                setUnitOperasionalTeknologiLainnya("");
                                handleFormChange(
                                  "unit_operasional_teknologi",
                                  "Pusdatin",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: unitOperasionalTeknologiType === "pusdatin" ? "#4338ca" : "#334155",
                                fontWeight: unitOperasionalTeknologiType === "pusdatin" ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              Pusdatin
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              backgroundColor: unitOperasionalTeknologiType === "lainnya" ? "#eff6ff" : "#fafbfc",
                              border: unitOperasionalTeknologiType === "lainnya" ? "1.5px solid #6366f1" : "1.5px solid #cbd5e1",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              minHeight: "48px",
                            }}
                            onMouseEnter={(e) => {
                              if (unitOperasionalTeknologiType !== "lainnya") {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = unitOperasionalTeknologiType === "lainnya" ? "#eff6ff" : "#fafbfc";
                              e.currentTarget.style.borderColor = unitOperasionalTeknologiType === "lainnya" ? "#6366f1" : "#cbd5e1";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <input
                              type="radio"
                              name="unit_operasional_teknologi"
                              checked={
                                unitOperasionalTeknologiType === "lainnya"
                              }
                              onChange={() => {
                                setUnitOperasionalTeknologiType("lainnya");
                                handleFormChange(
                                  "unit_operasional_teknologi",
                                  unitOperasionalTeknologiLainnya,
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#6366f1",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: unitOperasionalTeknologiType === "lainnya" ? "#4338ca" : "#334155",
                                fontWeight: unitOperasionalTeknologiType === "lainnya" ? 600 : 500,
                                lineHeight: "1.5",
                              }}
                            >
                              Lainnya
                            </span>
                          </label>

                          {unitOperasionalTeknologiType === "lainnya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={unitOperasionalTeknologiLainnya}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setUnitOperasionalTeknologiLainnya(text);
                                  handleFormChange(
                                    "unit_operasional_teknologi",
                                    text,
                                  );
                                }}
                                placeholder="Sebutkan unit operasional teknologi..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nilai Pengembangan Aplikasi - Full width */}
                  <div style={{ marginTop: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Nilai Pengembangan Aplikasi
                      </label>
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#64748b",
                          marginTop: "-4px",
                          marginBottom: "8px",
                        }}
                      >
                        Untuk kebutuhan BPK
                      </span>
                      <input
                        data-field="nilai_pengembangan_aplikasi"
                        value={formData.nilai_pengembangan_aplikasi}
                        onChange={(e) =>
                          handleFormChange(
                            "nilai_pengembangan_aplikasi",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: 500000000 (dalam Rupiah)"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.nilai_pengembangan_aplikasi
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.nilai_pengembangan_aplikasi
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Pusat Komputasi Utama <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="pusat_komputasi_utama"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.pusat_komputasi_utama
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.pusat_komputasi_utama
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_utama"
                              checked={pusatKomputasiUtamaType === "dc_gambir"}
                              onChange={() => {
                                setPusatKomputasiUtamaType("dc_gambir");
                                setPusatKomputasiUtamaLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_utama",
                                  "DC Gambir",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              DC Gambir
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_utama"
                              checked={pusatKomputasiUtamaType === "dc_cyber"}
                              onChange={() => {
                                setPusatKomputasiUtamaType("dc_cyber");
                                setPusatKomputasiUtamaLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_utama",
                                  "DC Cyber",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              DC Cyber
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_utama"
                              checked={pusatKomputasiUtamaType === "lainnya"}
                              onChange={() => {
                                setPusatKomputasiUtamaType("lainnya");
                                handleFormChange(
                                  "pusat_komputasi_utama",
                                  pusatKomputasiUtamaLainnya,
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Lainnya
                            </span>
                          </label>

                          {pusatKomputasiUtamaType === "lainnya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={pusatKomputasiUtamaLainnya}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setPusatKomputasiUtamaLainnya(text);
                                  handleFormChange(
                                    "pusat_komputasi_utama",
                                    text,
                                  );
                                }}
                                placeholder="Sebutkan pusat komputasi utama..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_utama"
                              checked={pusatKomputasiUtamaType === "tidak_ada"}
                              onChange={() => {
                                setPusatKomputasiUtamaType("tidak_ada");
                                setPusatKomputasiUtamaLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_utama",
                                  "Tidak Ada",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Tidak Ada (untuk Android & Desktop)
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Pusat Komputasi Backup <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="pusat_komputasi_backup"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.pusat_komputasi_backup
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.pusat_komputasi_backup
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_backup"
                              checked={pusatKomputasiBackupType === "dc_gambir"}
                              onChange={() => {
                                setPusatKomputasiBackupType("dc_gambir");
                                setPusatKomputasiBackupLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_backup",
                                  "DC Gambir",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              DC Gambir
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_backup"
                              checked={pusatKomputasiBackupType === "dc_cyber"}
                              onChange={() => {
                                setPusatKomputasiBackupType("dc_cyber");
                                setPusatKomputasiBackupLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_backup",
                                  "DC Cyber",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              DC Cyber
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_backup"
                              checked={pusatKomputasiBackupType === "lainnya"}
                              onChange={() => {
                                setPusatKomputasiBackupType("lainnya");
                                handleFormChange(
                                  "pusat_komputasi_backup",
                                  pusatKomputasiBackupLainnya,
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Lainnya
                            </span>
                          </label>

                          {pusatKomputasiBackupType === "lainnya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={pusatKomputasiBackupLainnya}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setPusatKomputasiBackupLainnya(text);
                                  handleFormChange(
                                    "pusat_komputasi_backup",
                                    text,
                                  );
                                }}
                                placeholder="Sebutkan pusat komputasi backup..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="pusat_komputasi_backup"
                              checked={pusatKomputasiBackupType === "tidak_ada"}
                              onChange={() => {
                                setPusatKomputasiBackupType("tidak_ada");
                                setPusatKomputasiBackupLainnya("");
                                handleFormChange(
                                  "pusat_komputasi_backup",
                                  "Tidak Ada",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Tidak Ada (untuk Android & Desktop)
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Mandiri Komputasi Backup <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="mandiri_komputasi_backup"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.mandiri_komputasi_backup
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.mandiri_komputasi_backup
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="mandiri_komputasi_backup"
                              checked={
                                mandiriKomputasiBackupType === "ex_storage"
                              }
                              onChange={() => {
                                setMandiriKomputasiBackupType("ex_storage");
                                setMandiriKomputasiBackupLainnya("");
                                handleFormChange(
                                  "mandiri_komputasi_backup",
                                  "Ex STORAGE",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Ex STORAGE
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="mandiri_komputasi_backup"
                              checked={
                                mandiriKomputasiBackupType === "in_storage"
                              }
                              onChange={() => {
                                setMandiriKomputasiBackupType("in_storage");
                                setMandiriKomputasiBackupLainnya("");
                                handleFormChange(
                                  "mandiri_komputasi_backup",
                                  "In STORAGE",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              In STORAGE
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="mandiri_komputasi_backup"
                              checked={
                                mandiriKomputasiBackupType === "ex_cloud"
                              }
                              onChange={() => {
                                setMandiriKomputasiBackupType("ex_cloud");
                                setMandiriKomputasiBackupLainnya("");
                                handleFormChange(
                                  "mandiri_komputasi_backup",
                                  "Ex CLOUD",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Ex CLOUD
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="mandiri_komputasi_backup"
                              checked={
                                mandiriKomputasiBackupType === "tidak_ada"
                              }
                              onChange={() => {
                                setMandiriKomputasiBackupType("tidak_ada");
                                setMandiriKomputasiBackupLainnya("");
                                handleFormChange(
                                  "mandiri_komputasi_backup",
                                  "TIDAK ADA",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              TIDAK ADA
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="mandiri_komputasi_backup"
                              checked={mandiriKomputasiBackupType === "lainnya"}
                              onChange={() => {
                                setMandiriKomputasiBackupType("lainnya");
                                handleFormChange(
                                  "mandiri_komputasi_backup",
                                  mandiriKomputasiBackupLainnya,
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              LAINNYA
                            </span>
                          </label>

                          {mandiriKomputasiBackupType === "lainnya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={mandiriKomputasiBackupLainnya}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setMandiriKomputasiBackupLainnya(text);
                                  handleFormChange(
                                    "mandiri_komputasi_backup",
                                    text,
                                  );
                                }}
                                placeholder="Sebutkan mandiri komputasi backup..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Perangkat Lunak <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="perangkat_lunak"
                        value={formData.perangkat_lunak}
                        onChange={(e) =>
                          handleFormChange("perangkat_lunak", e.target.value)
                        }
                        placeholder="Contoh: Windows Server, Linux Ubuntu"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.perangkat_lunak
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.perangkat_lunak
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Cloud <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="cloud"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.cloud
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.cloud
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="cloud"
                              checked={cloudType === "ya"}
                              onChange={() => {
                                setCloudType("ya");
                                handleFormChange("cloud", cloudYaText);
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Ya
                            </span>
                          </label>

                          {cloudType === "ya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={cloudYaText}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setCloudYaText(text);
                                  handleFormChange("cloud", text);
                                }}
                                placeholder="Contoh: AWS, Google Cloud, Azure"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="cloud"
                              checked={cloudType === "tidak"}
                              onChange={() => {
                                setCloudType("tidak");
                                setCloudYaText("");
                                handleFormChange("cloud", "Tidak");
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Tidak
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        SSL <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="ssl"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.ssl
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.ssl ? errorBoxShadow : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="ssl"
                              checked={sslType === "aktif_pusdatin"}
                              onChange={() => {
                                setSslType("aktif_pusdatin");
                                setSslUnitKerja("");
                                handleFormChange("ssl", "Aktif/Pusdatin");
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Aktif/Pusdatin
                            </span>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="ssl"
                              checked={sslType === "aktif_unit_kerja"}
                              onChange={() => {
                                setSslType("aktif_unit_kerja");
                                handleFormChange(
                                  "ssl",
                                  sslUnitKerja
                                    ? `Aktif/${sslUnitKerja}`
                                    : "Aktif/Unit Kerja",
                                );
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Aktif/Unit Kerja
                            </span>
                          </label>

                          {sslType === "aktif_unit_kerja" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={sslUnitKerja}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setSslUnitKerja(text);
                                  handleFormChange(
                                    "ssl",
                                    text ? `Aktif/${text}` : "Aktif/Unit Kerja",
                                  );
                                }}
                                placeholder="Sebutkan unit kerja pengelola SSL..."
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Tanggal Expired SSL <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        data-field="ssl_expired"
                        value={formData.ssl_expired}
                        onChange={(e) =>
                          handleFormChange("ssl_expired", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.ssl_expired
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.ssl_expired
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Antivirus <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div
                        data-field="antivirus"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: fieldErrors.antivirus
                            ? `1px solid ${errorBorderColor}`
                            : "1px solid #e2e8f0",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.antivirus
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="antivirus"
                              checked={antivirusType === "ya"}
                              onChange={() => {
                                setAntivirusType("ya");
                                handleFormChange("antivirus", antivirusYaText);
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Ya
                            </span>
                          </label>

                          {antivirusType === "ya" && (
                            <div
                              style={{ marginTop: "4px", paddingLeft: "26px" }}
                            >
                              <input
                                type="text"
                                value={antivirusYaText}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setAntivirusYaText(text);
                                  handleFormChange("antivirus", text);
                                }}
                                placeholder="Contoh: Kaspersky, Norton, Avast"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 10px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            <input
                              type="radio"
                              name="antivirus"
                              checked={antivirusType === "tidak"}
                              onChange={() => {
                                setAntivirusType("tidak");
                                setAntivirusYaText("");
                                handleFormChange("antivirus", "Tidak");
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                marginRight: "10px",
                                cursor: "pointer",
                                accentColor: "#0ea5e9",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.4",
                              }}
                            >
                              Tidak
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Alamat IP Publik <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="alamat_ip_publik"
                        value={formData.alamat_ip_publik}
                        onChange={(e) => handleIpChange(e.target.value)}
                        placeholder="IPv4: 192.168.1.1 atau IPv6: 2001:0db8:85a3::8a2e:0370:7334"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.alamat_ip_publik
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.alamat_ip_publik
                            ? errorBoxShadow
                            : "none",
                          fontFamily: "monospace",
                        }}
                      />
                      <small
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        Format: IPv4 (xxx.xxx.xxx.xxx) atau IPv6
                      </small>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Keterangan <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-field="keterangan"
                        value={formData.keterangan}
                        onChange={(e) =>
                          handleFormChange("keterangan", e.target.value)
                        }
                        placeholder="Contoh: Aplikasi masih dalam tahap pengembangan"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.keterangan
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.keterangan
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Status BMN <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {[
                          { value: "ya", label: "Ya" },
                          { value: "tidak", label: "Tidak" },
                        ].map((option) => {
                          const isChecked = formData.status_bmn === option.value;
                          return (
                            <label
                              key={option.value}
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 14px",
                                cursor: "pointer",
                                borderRadius: "10px",
                                backgroundColor: isChecked ? "#eff6ff" : "#f8fafc",
                                border: isChecked
                                  ? "1.5px solid #6366f1"
                                  : fieldErrors.status_bmn
                                    ? `1.5px solid ${errorBorderColor}`
                                    : "1.5px solid #cbd5e1",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: fieldErrors.status_bmn
                                  ? errorBoxShadow
                                  : "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#8b5cf6";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f8fafc";
                                  e.currentTarget.style.borderColor = fieldErrors.status_bmn
                                    ? errorBorderColor
                                    : "#cbd5e1";
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="status_bmn"
                                value={option.value}
                                checked={isChecked}
                                onChange={(e) =>
                                  handleFormChange("status_bmn", e.target.value)
                                }
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginRight: "10px",
                                  cursor: "pointer",
                                  accentColor: "#6366f1",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: isChecked ? "#4338ca" : "#334155",
                                  fontWeight: isChecked ? 600 : 500,
                                }}
                              >
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Server Aplikasi <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        data-field="server_aplikasi"
                        value={formData.server_aplikasi}
                        onChange={(e) =>
                          handleFormChange("server_aplikasi", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.server_aplikasi
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.server_aplikasi
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="Virtual Machine">Virtual Machine</option>
                        <option value="Baremetal">Baremetal</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Tipe Lisensi Bahasa Pemrograman <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {[
                          { value: "Open Source", label: "Open Source" },
                          { value: "Lisensi", label: "Lisensi" },
                        ].map((option) => {
                          const isChecked = formData.tipe_lisensi_bahasa === option.value;
                          return (
                            <label
                              key={option.value}
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 14px",
                                cursor: "pointer",
                                borderRadius: "10px",
                                backgroundColor: isChecked ? "#eff6ff" : "#f8fafc",
                                border: isChecked
                                  ? "1.5px solid #6366f1"
                                  : fieldErrors.tipe_lisensi_bahasa
                                    ? `1.5px solid ${errorBorderColor}`
                                    : "1.5px solid #cbd5e1",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: fieldErrors.tipe_lisensi_bahasa
                                  ? errorBoxShadow
                                  : "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#8b5cf6";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f8fafc";
                                  e.currentTarget.style.borderColor = fieldErrors.tipe_lisensi_bahasa
                                    ? errorBorderColor
                                    : "#cbd5e1";
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="tipe_lisensi_bahasa"
                                value={option.value}
                                checked={isChecked}
                                onChange={(e) =>
                                  handleFormChange("tipe_lisensi_bahasa", e.target.value)
                                }
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginRight: "10px",
                                  cursor: "pointer",
                                  accentColor: "#6366f1",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: isChecked ? "#4338ca" : "#334155",
                                  fontWeight: isChecked ? 600 : 500,
                                }}
                              >
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        API Internal Sistem Integrasi <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {[
                          { value: "tersedia", label: "Tersedia" },
                          { value: "tidak", label: "Tidak" },
                        ].map((option) => {
                          const isChecked = formData.api_internal_status === option.value;
                          return (
                            <label
                              key={option.value}
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 14px",
                                cursor: "pointer",
                                borderRadius: "10px",
                                backgroundColor: isChecked ? "#eff6ff" : "#f8fafc",
                                border: isChecked
                                  ? "1.5px solid #6366f1"
                                  : fieldErrors.api_internal_status
                                    ? `1.5px solid ${errorBorderColor}`
                                    : "1.5px solid #cbd5e1",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: fieldErrors.api_internal_status
                                  ? errorBoxShadow
                                  : "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#8b5cf6";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChecked) {
                                  e.currentTarget.style.backgroundColor = "#f8fafc";
                                  e.currentTarget.style.borderColor = fieldErrors.api_internal_status
                                    ? errorBorderColor
                                    : "#cbd5e1";
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="api_internal_status"
                                value={option.value}
                                checked={isChecked}
                                onChange={(e) =>
                                  handleFormChange("api_internal_status", e.target.value)
                                }
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginRight: "10px",
                                  cursor: "pointer",
                                  accentColor: "#6366f1",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: isChecked ? "#4338ca" : "#334155",
                                  fontWeight: isChecked ? 600 : 500,
                                }}
                              >
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        WAF <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          data-field="waf"
                          value={formData.waf}
                          onChange={(e) =>
                            handleFormChange("waf", e.target.value)
                          }
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                            borderColor: fieldErrors.waf
                              ? errorBorderColor
                              : "#e6eef6",
                            boxShadow: fieldErrors.waf
                              ? errorBoxShadow
                              : "none",
                          }}
                        >
                          <option value="">-Pilih-</option>
                          <option value="ya">Ya</option>
                          <option value="tidak">Tidak</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                        {formData.waf === "lainnya" && (
                          <input
                            data-field="waf_lainnya"
                            value={formData.waf_lainnya}
                            onChange={(e) =>
                              handleFormChange("waf_lainnya", e.target.value)
                            }
                            placeholder="Sebutkan"
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #e6eef6",
                              borderColor: fieldErrors.waf_lainnya
                                ? errorBorderColor
                                : "#e6eef6",
                              boxShadow: fieldErrors.waf_lainnya
                                ? errorBoxShadow
                                : "none",
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        VA/PT <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          data-field="va_pt_status"
                          value={formData.va_pt_status}
                          onChange={(e) =>
                            handleFormChange("va_pt_status", e.target.value)
                          }
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                            borderColor: fieldErrors.va_pt_status
                              ? errorBorderColor
                              : "#e6eef6",
                            boxShadow: fieldErrors.va_pt_status
                              ? errorBoxShadow
                              : "none",
                          }}
                        >
                          <option value="">-Pilih-</option>
                          <option value="ya">Ya</option>
                          <option value="tidak">Tidak</option>
                        </select>
                        {formData.va_pt_status === "ya" && (
                          <input
                            type="date"
                            data-field="va_pt_waktu"
                            value={formData.va_pt_waktu}
                            onChange={(e) =>
                              handleFormChange("va_pt_waktu", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #e6eef6",
                              borderColor: fieldErrors.va_pt_waktu
                                ? errorBorderColor
                                : "#e6eef6",
                              boxShadow: fieldErrors.va_pt_waktu
                                ? errorBoxShadow
                                : "none",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Informasi Tambahan (Dynamic Fields) */}
                {dynamicTables.length > 0 && (
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                      borderTop: "2px solid #e2e8f0",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                      >
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                      Informasi Tambahan
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                      }}
                    >
                      {dynamicTables.map((table) => {
                        const fieldName = `${table.table_name}_id`;
                        const data = dynamicMasterData[table.table_name] || [];
                        const idField = table.id_field_name;

                        // Cari kolom pertama yang bukan ID untuk ditampilkan sebagai label
                        let displayField = null;
                        try {
                          const schema = JSON.parse(table.table_schema || "[]");
                          if (schema.length > 0) {
                            displayField = schema[0].column_name;
                          }
                        } catch (e) {
                          // Fallback: ambil key pertama dari data (selain id)
                          if (data.length > 0) {
                            const keys = Object.keys(data[0]).filter(
                              (k) =>
                                k !== idField &&
                                !k.includes("_at") &&
                                !k.includes("_by") &&
                                k !== "status_aktif",
                            );
                            if (keys.length > 0) displayField = keys[0];
                          }
                        }

                        return (
                          <div key={table.registry_id}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "#334155",
                                fontSize: "13px",
                              }}
                            >
                              {table.display_name}
                            </label>
                            <select
                              data-field={fieldName}
                              value={formData[fieldName] || ""}
                              onChange={(e) =>
                                handleFormChange(fieldName, e.target.value)
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e6eef6",
                                borderColor: fieldErrors[fieldName]
                                  ? errorBorderColor
                                  : "#e6eef6",
                                boxShadow: fieldErrors[fieldName]
                                  ? errorBoxShadow
                                  : "none",
                              }}
                            >
                              <option value="">
                                -- Pilih {table.display_name} --
                              </option>
                              {data
                                .filter(
                                  (item) =>
                                    item.status_aktif === 1 ||
                                    item.status_aktif === true,
                                )
                                .map((item) => (
                                  <option
                                    key={item[idField]}
                                    value={item[idField]}
                                  >
                                    {displayField && item[displayField]
                                      ? item[displayField]
                                      : item[idField]}
                                  </option>
                                ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AKSES APLIKASI (AKUN) - Untuk kebutuhan BPK */}
                <div
                  style={{
                    marginTop: "32px",
                    paddingTop: "28px",
                    borderTop: "1px solid #cbd5e1",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    AKSES APLIKASI (AKUN)
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: 0,
                      marginBottom: "16px",
                      fontStyle: "italic",
                    }}
                  >
                    (untuk kebutuhan BPK)
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Username
                      </label>
                      <input
                        data-field="akses_aplikasi_username"
                        value={formData.akses_aplikasi_username}
                        onChange={(e) =>
                          handleFormChange(
                            "akses_aplikasi_username",
                            e.target.value.toLowerCase(),
                          )
                        }
                        placeholder="Masukkan username"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          textTransform: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          data-field="akses_aplikasi_password"
                          value={formData.akses_aplikasi_password}
                          onChange={(e) =>
                            handleFormChange(
                              "akses_aplikasi_password",
                              e.target.value,
                            )
                          }
                          placeholder="Masukkan password"
                          style={{
                            width: "100%",
                            padding: "10px",
                            paddingRight: "40px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                            borderColor: fieldErrors.akses_aplikasi_password
                              ? errorBorderColor
                              : "#e6eef6",
                            boxShadow: fieldErrors.akses_aplikasi_password
                              ? errorBoxShadow
                              : "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            color: "#64748b",
                            fontSize: "18px",
                          }}
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "13px",
                        }}
                      >
                        Konfirmasi Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showKonfirmasiPassword ? "text" : "password"}
                          data-field="akses_aplikasi_konfirmasi_password"
                          value={formData.akses_aplikasi_konfirmasi_password}
                          onChange={(e) =>
                            handleFormChange(
                              "akses_aplikasi_konfirmasi_password",
                              e.target.value,
                            )
                          }
                          placeholder="Konfirmasi password"
                          style={{
                            width: "100%",
                            padding: "10px",
                            paddingRight: "40px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                            borderColor:
                              fieldErrors.akses_aplikasi_konfirmasi_password
                                ? errorBorderColor
                                : "#e6eef6",
                            boxShadow:
                              fieldErrors.akses_aplikasi_konfirmasi_password
                                ? errorBoxShadow
                                : "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKonfirmasiPassword(!showKonfirmasiPassword)
                          }
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            color: "#64748b",
                            fontSize: "18px",
                          }}
                        >
                          {showKonfirmasiPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "8px",
                      fontStyle: "italic",
                    }}
                  >
                    OPSIONAL. JIKA MENGISI PASSWORD, KONFIRMASI HARUS SAMA.
                  </p>
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "20px",
                    fontSize: "12px",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Catatan: Field yang ditandai dengan <span style={{ color: "#ef4444" }}>*</span> wajib diisi
                </small>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1.5px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.color = "#475569";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "8px 22px",
                      borderRadius: "8px",
                      border: "none",
                      background: submitting
                        ? "linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)"
                        : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      color: "#fff",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: submitting
                        ? "none"
                        : "0 2px 8px rgba(79, 70, 229, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                    onMouseOver={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 14px rgba(79, 70, 229, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(79, 70, 229, 0.3)";
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
                        >
                          <path
                            d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            animation: "fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)",
              maxWidth: "480px",
              width: "90%",
              animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #f1f5f9",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                  margin: 0,
                  fontSize: "15px",
                  color: "#64748b",
                  lineHeight: 1.5,
                }}
              >
                {editMode
                  ? "Apakah anda yakin ingin memperbarui data?"
                  : "Apakah data yang diisi sudah benar?"}
              </p>
            </div>
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "12px",
              }}
            >
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
              >
                Ya
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
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
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div
          onClick={() => setShowDetailModal(false)}
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
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "slideUp 0.3s ease-out",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "0",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                    </svg>
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#ffffff",
                        marginBottom: "2px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {selectedApp.nama_aplikasi}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.9)",
                        fontWeight: 500,
                      }}
                    >
                      Informasi lengkap aplikasi
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.3)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "20px 24px",
                overflowY: "auto",
                flex: 1,
                backgroundColor: "#f9fafb",
              }}
            >
              {/* Basic Info */}
              <DetailSection title="Informasi Umum">
                <DetailField
                  label="Nama Aplikasi"
                  value={selectedApp.nama_aplikasi}
                />
                <DetailField
                  label="Domain"
                  value={selectedApp.domain}
                  isLink={true}
                />
                <DetailField
                  label="Status"
                  value={selectedApp.nama_status}
                  isBadge={true}
                />
                <DetailField
                  label="Frekuensi Pemakaian"
                  value={selectedApp.frekuensi_pemakaian}
                />
              </DetailSection>

              {/* Description */}
              <DetailSection title="Deskripsi & Fungsi">
                <DetailField
                  label="Deskripsi/Fungsi"
                  value={selectedApp.deskripsi_fungsi}
                  isTextarea={true}
                />
                <DetailField
                  label="User/Pengguna"
                  value={selectedApp.user_pengguna}
                  isTextarea={true}
                />
                <DetailField
                  label="Data yang Digunakan"
                  value={selectedApp.data_digunakan}
                  isTextarea={true}
                />
                <DetailField
                  label="Luaran/Output"
                  value={selectedApp.luaran_output}
                  isTextarea={true}
                />
              </DetailSection>

              {/* Organization */}
              <DetailSection title="Unit & PIC">
                <DetailField
                  label="Eselon 1"
                  value={selectedApp.nama_eselon1}
                />
                <DetailField
                  label="Eselon 2"
                  value={selectedApp.nama_eselon2}
                />
                <DetailField label="UPT" value={selectedApp.nama_upt} />
                <DetailField
                  label="PIC Internal"
                  value={selectedApp.nama_pic_internal}
                />
                <DetailField
                  label="Kontak PIC Internal"
                  value={selectedApp.kontak_pic_internal}
                />
                <DetailField
                  label="PIC Eksternal"
                  value={selectedApp.nama_pic_eksternal}
                />
                <DetailField
                  label="Kontak PIC Eksternal"
                  value={selectedApp.kontak_pic_eksternal}
                />
              </DetailSection>

              {/* Technical Info */}
              <DetailSection title="Informasi Teknis">
                <DetailField
                  label="Bahasa Pemrograman"
                  value={selectedApp.bahasa_pemrograman}
                />
                <DetailField
                  label="Basis Data"
                  value={selectedApp.basis_data}
                />
                <DetailField
                  label="Kerangka Pengembangan"
                  value={selectedApp.kerangka_pengembangan}
                />
                <DetailField
                  label="Environment"
                  value={selectedApp.nama_environment}
                />
                <DetailField
                  label="Cara Akses"
                  value={(() => {
                    if (selectedApp.nama_cara_akses) {
                      try {
                        const parsed = JSON.parse(selectedApp.nama_cara_akses);
                        return Array.isArray(parsed)
                          ? parsed.join(", ")
                          : selectedApp.nama_cara_akses;
                      } catch {
                        return selectedApp.nama_cara_akses;
                      }
                    }
                    return null;
                  })()}
                />
                <DetailField
                  label="Alamat IP Publik"
                  value={selectedApp.alamat_ip_publik}
                />
                <DetailField
                  label="Server Aplikasi"
                  value={selectedApp.server_aplikasi}
                />
                <DetailField label="Cloud" value={selectedApp.cloud} />
                <DetailField
                  label="Perangkat Lunak"
                  value={selectedApp.perangkat_lunak}
                />
                <DetailField
                  label="Tipe Lisensi Bahasa"
                  value={selectedApp.tipe_lisensi_bahasa}
                />
              </DetailSection>

              {/* Security */}
              <DetailSection title="Keamanan">
                <DetailField label="SSL" value={selectedApp.ssl} />
                <DetailField
                  label="Tanggal Expired SSL"
                  value={
                    selectedApp.ssl_expired
                      ? new Date(selectedApp.ssl_expired).toLocaleDateString(
                        "id-ID",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                      : null
                  }
                />
                <DetailField label="WAF" value={selectedApp.waf} />
                <DetailField
                  label="WAF Lainnya"
                  value={selectedApp.waf_lainnya}
                />
                <DetailField label="Antivirus" value={selectedApp.antivirus} />
                <DetailField
                  label="VA/PT Status"
                  value={selectedApp.va_pt_status}
                />
                <DetailField
                  label="VA/PT Waktu"
                  value={selectedApp.va_pt_waktu}
                />
                <DetailField
                  label="API Internal"
                  value={selectedApp.api_internal_status}
                />
              </DetailSection>

              {/* Infrastructure */}
              <DetailSection title="Infrastruktur & Operasional">
                <DetailField label="PDN Utama" value={selectedApp.nama_pdn} />
                <DetailField
                  label="PDN Backup"
                  value={selectedApp.pdn_backup}
                />
                <DetailField
                  label="Pusat Komputasi Utama"
                  value={selectedApp.pusat_komputasi_utama}
                />
                <DetailField
                  label="Pusat Komputasi Backup"
                  value={selectedApp.pusat_komputasi_backup}
                />
                <DetailField
                  label="Mandiri Komputasi Backup"
                  value={selectedApp.mandiri_komputasi_backup}
                />
                <DetailField
                  label="Unit Pengembang"
                  value={selectedApp.unit_pengembang}
                />
                <DetailField
                  label="Unit Operasional Teknologi"
                  value={selectedApp.unit_operasional_teknologi}
                />
                <DetailField
                  label="Status BMN"
                  value={selectedApp.status_bmn}
                />
                <DetailField
                  label="Nilai Pengembangan"
                  value={
                    selectedApp.nilai_pengembangan_aplikasi
                      ? `Rp ${Number(selectedApp.nilai_pengembangan_aplikasi).toLocaleString("id-ID")}`
                      : null
                  }
                />
              </DetailSection>

              {/* Additional Info */}
              {selectedApp.keterangan && (
                <DetailSection title="Keterangan Tambahan">
                  <DetailField
                    label="Keterangan"
                    value={selectedApp.keterangan}
                    isTextarea={true}
                  />
                </DetailSection>
              )}

              {/* Dynamic Fields / Informasi Tambahan */}
              {dynamicTables.length > 0 &&
                (() => {
                  const dynamicFields = dynamicTables.filter((table) => {
                    const fieldName = `${table.table_name}_id`;
                    return selectedApp[fieldName];
                  });

                  if (dynamicFields.length === 0) return null;

                  return (
                    <DetailSection title="Informasi Tambahan">
                      {dynamicFields.map((table) => {
                        const fieldName = `${table.table_name}_id`;
                        const fieldValue = selectedApp[fieldName];
                        const data = dynamicMasterData[table.table_name] || [];
                        const idField = table.id_field_name;

                        // Cari display value dari master data
                        let displayValue = fieldValue;
                        if (data.length > 0) {
                          const item = data.find(
                            (d) => String(d[idField]) === String(fieldValue),
                          );
                          if (item) {
                            // Cari kolom pertama yang bukan ID untuk ditampilkan
                            try {
                              const schema = JSON.parse(
                                table.table_schema || "[]",
                              );
                              if (schema.length > 0) {
                                const displayField = schema[0].column_name;
                                displayValue = item[displayField] || fieldValue;
                              }
                            } catch (e) {
                              // Fallback: ambil key pertama selain id
                              const keys = Object.keys(item).filter(
                                (k) =>
                                  k !== idField &&
                                  !k.includes("_at") &&
                                  !k.includes("_by") &&
                                  k !== "status_aktif",
                              );
                              if (keys.length > 0) {
                                displayValue = item[keys[0]] || fieldValue;
                              }
                            }
                          }
                        }

                        return (
                          <DetailField
                            key={table.registry_id}
                            label={table.display_name}
                            value={displayValue}
                          />
                        );
                      })}
                    </DetailSection>
                  );
                })()}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                background: "linear-gradient(to top, #f9fafb 0%, #ffffff 100%)",
              }}
            >
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedApp.nama_aplikasi);
                }}
                style={{
                  padding: "10px 20px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(102, 126, 234, 0.5)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }}
              >
                <svg
                  width="14"
                  height="16"
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
                Edit Aplikasi
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ffffff",
                  color: "#6b7280",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper component for detail section
function DetailSection({ title, children }) {
  const getSectionIcon = (title) => {
    if (title.includes("Umum"))
      return <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
    if (title.includes("Deskripsi") || title.includes("Fungsi"))
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h6" />
        </>
      );
    if (title.includes("Unit") || title.includes("PIC"))
      return (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    if (title.includes("Teknis"))
      return (
        <>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </>
      );
    if (title.includes("Keamanan"))
      return (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      );
    if (title.includes("Infrastruktur"))
      return (
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </>
      );
    if (title.includes("Tambahan"))
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </>
      );
    return <path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z" />;
  };

  return (
    <div
      style={{
        marginBottom: "16px",
        padding: "0",
        backgroundColor: "transparent",
        borderRadius: "12px",
        border: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "10px 16px",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {getSectionIcon(title)}
          </svg>
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          padding: "16px",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px",
          border: "1px solid #e5e7eb",
          borderTop: "none",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "14px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Helper component for detail field
function DetailField({ label, value, isLink, isBadge, isTextarea }) {
  const displayValue = value || "-";

  if (isLink && value) {
    return (
      <div style={{ marginBottom: isTextarea ? "16px" : "0" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          {label}
        </div>
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#667eea",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
            wordBreak: "break-all",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#764ba2";
            e.currentTarget.style.gap = "8px";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#667eea";
            e.currentTarget.style.gap = "6px";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
          {value}
        </a>
      </div>
    );
  }

  if (isBadge && value) {
    const status = value.toLowerCase();
    let bg = "#d1fae5";
    let color = "#065f46";
    let borderColor = "#6ee7b7";
    if (status.includes("pengembang") || status.includes("pengembangan")) {
      bg = "#fed7aa";
      color = "#92400e";
      borderColor = "#fbbf24";
    } else if (status.includes("tidak")) {
      bg = "#fecaca";
      color = "#991b1b";
      borderColor = "#f87171";
    }

    return (
      <div style={{ marginBottom: isTextarea ? "16px" : "0" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          {label}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "10px",
            backgroundColor: bg,
            color: color,
            fontWeight: 600,
            fontSize: "12px",
            letterSpacing: "0.3px",
            border: `2px solid ${borderColor}`,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 0 2px ${bg}`,
            }}
          />
          {value}
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: isTextarea ? "16px" : "0" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: displayValue === "-" ? "#9ca3af" : "#1f2937",
          fontWeight: displayValue === "-" ? 400 : 500,
          lineHeight: "1.6",
          wordBreak: "break-word",
          whiteSpace: isTextarea ? "pre-wrap" : "normal",
          padding: isTextarea ? "12px" : "0",
          backgroundColor: isTextarea ? "#f9fafb" : "transparent",
          borderRadius: isTextarea ? "8px" : "0",
          border: isTextarea ? "1px solid #e5e7eb" : "none",
        }}
      >
        {displayValue}
      </div>
    </div>
  );
}

export default OperatorEselon1DataAplikasi;
