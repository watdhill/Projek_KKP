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
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalAppName, setOriginalAppName] = useState("");
  const [master, setMaster] = useState({});
  const [dynamicTables, setDynamicTables] = useState([]);
  const [dynamicMasterData, setDynamicMasterData] = useState({});
  const [showCaraAksesDropdown, setShowCaraAksesDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_aplikasi: "",
    domain: "",
    deskripsi_fungsi: "",
    user_pengguna: "",
    data_digunakan: "",
    luaran_output: "",
    eselon1_id: "",
    eselon2_id: "",
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

  const filtered = apps.filter((a) => {
    if (statusFilter !== "all") {
      const status = (a.nama_status || "").toLowerCase();
      if (status !== statusFilter) return false;
    }

    if (filterEselon2) {
      if (String(a.eselon2_id) !== String(filterEselon2)) return false;
    }

    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (a.nama_aplikasi || "").toLowerCase().includes(s) ||
      (a.pic_internal || "").toLowerCase().includes(s) ||
      (a.nama_eselon1 || "").toLowerCase().includes(s)
    );
  });

  const getStatusBadge = (app) => {
    const status = (app.nama_status || "Aktif").toLowerCase();
    if (status === "aktif")
      return { label: "Aktif", bg: "#dcfce7", color: "#166534" };
    if (status.includes("pengembang") || status.includes("pengembangan"))
      return {
        label: app.nama_status || "Pengembangan",
        bg: "#fff7ed",
        color: "#b45309",
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

  // Fetch PIC based on eselon2_id
  const fetchPICByEselon2 = async (eselon2_id) => {
    if (!eselon2_id) {
      // Reset PIC data jika eselon2_id kosong
      setMaster((prev) => ({
        ...prev,
        pic_internal: [],
        pic_eksternal: [],
      }));
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/master-data/dropdown?eselon2_id=${eselon2_id}`,
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
      console.error("Failed to fetch PIC by eselon2", e);
    }
  };

  // Open modal and load master data
  const openModal = async () => {
    await fetchMasterDropdowns();
    setEditMode(false);
    setOriginalAppName("");
    setFieldErrors({});
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
        waf_lainnya: "",
        va_pt_status: app.va_pt_status || "",
        va_pt_waktu: app.va_pt_waktu || "",
        antivirus: app.antivirus || "",
      };

      // Add dynamic fields with prefill from database
      dynamicTables.forEach((table) => {
        const fieldName = `${table.table_name}_id`;
        baseFormData[fieldName] = app[fieldName] ? String(app[fieldName]) : "";
      });

      setFormData(baseFormData);

      // Fetch PIC berdasarkan eselon2_id jika ada
      if (app.eselon2_id) {
        await fetchPICByEselon2(String(app.eselon2_id));
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

    // Jika eselon2_id berubah, fetch PIC yang sesuai dan reset PIC fields
    if (k === "eselon2_id") {
      fetchPICByEselon2(v);
      // Reset PIC fields ketika eselon2 berubah
      setFormData((prev) => ({
        ...prev,
        [k]: v,
        pic_internal: "",
        pic_eksternal: "",
        kontak_pic_internal: "",
        kontak_pic_eksternal: "",
      }));
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
        eselon2_id: "Eselon 2",
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
      };

      // Add dynamic fields to payload
      dynamicTables.forEach((table) => {
        const fieldName = `${table.table_name}_id`;
        payload[fieldName] = formData[fieldName] || null;
      });

      const url = editMode
        ? `http://localhost:5000/api/aplikasi/${encodeURIComponent(
            originalAppName,
          )}`
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
      if (status === 409 || payload?.code === "DUPLICATE_NAMA_APLIKASI") {
        showMessage(
          "error",
          "Nama aplikasi sudah ada di database!\n\n" +
            "Silakan gunakan nama yang berbeda atau edit aplikasi yang sudah ada.",
          7000,
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
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
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
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
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
                marginBottom: "3px",
                fontSize: "20px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Data Aplikasi
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "12.5px",
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
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{ position: "relative", flex: "1 1 360px", minWidth: "250px" }}
        >
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
            flex: "2 1 520px",
            minWidth: "260px",
          }}
        >
          <option value="">{userNamaEselon1 || "-"}</option>
        </select>

        {/* Force next row like admin layout (search + eselon1 on first row) */}
        <div style={{ flexBasis: "100%", height: 0 }} />

        {/* Filter Eselon 2 */}
        <select
          value={filterEselon2}
          onChange={(e) => setFilterEselon2(e.target.value)}
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
            flex: "1 1 420px",
            minWidth: "260px",
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
          <option value="">Semua Eselon 2</option>
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
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status Aplikasi
                    </th>
                    <th
                      style={{
                        width: "160px",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Tanggal Expired SSL
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
                  {filtered.map((app, i) => {
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
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.15s ease",
                          height: "70px",
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
                          {i + 1}
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
                            onClick={() => openEditModal(app.nama_aplikasi)}
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
          Total: {filtered.length} aplikasi ditampilkan
        </div>
      )}

      {/* Modal for input/edit */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
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
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              background: "#fff",
              borderRadius: "14px",
              boxShadow:
                "0 12px 40px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                padding: "16px 20px",
                borderTopLeftRadius: "14px",
                borderTopRightRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {editMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
              <form onSubmit={handleSubmitForm} style={{ padding: "24px" }}>
                {/* Informasi Dasar */}
                <div
                  style={{
                    marginBottom: "24px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "16px",
                      marginTop: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "16px",
                        background:
                          "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                        borderRadius: "2px",
                      }}
                    ></div>
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
                      Nama Aplikasi
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
                      Deskripsi dan Fungsi
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
                    marginBottom: "24px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "16px",
                      marginTop: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "16px",
                        background:
                          "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                        borderRadius: "2px",
                      }}
                    ></div>
                    Lokasi & Penggunaan
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "14px",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
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
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          borderColor: fieldErrors.eselon1_id
                            ? errorBorderColor
                            : "#e2e8f0",
                          fontSize: "13px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.eselon1_id
                            ? errorRing
                            : "none",
                        }}
                        disabled
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#0ea5e9";
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(14, 165, 233, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            fieldErrors.eselon1_id
                              ? errorBorderColor
                              : "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#fafbfc";
                          e.currentTarget.style.boxShadow =
                            fieldErrors.eselon1_id ? errorRing : "none";
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Eselon 2
                      </label>
                      <select
                        data-field="eselon2_id"
                        value={formData.eselon2_id}
                        onChange={(e) =>
                          handleFormChange("eselon2_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.eselon2_id
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.eselon2_id
                            ? errorBoxShadow
                            : "none",
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

                    <div style={{ position: "relative" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Cara Akses Aplikasi
                      </label>
                      <div
                        data-field="cara_akses_id"
                        tabIndex={0}
                        role="button"
                        onClick={() =>
                          setShowCaraAksesDropdown(!showCaraAksesDropdown)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowCaraAksesDropdown(!showCaraAksesDropdown);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          color: "#0f172a",
                          backgroundColor: showCaraAksesDropdown
                            ? "#fff"
                            : "#fafbfc",
                          borderColor: fieldErrors.cara_akses_id
                            ? errorBorderColor
                            : showCaraAksesDropdown
                              ? "#0ea5e9"
                              : "#e2e8f0",
                          boxShadow: fieldErrors.cara_akses_id
                            ? errorRing
                            : showCaraAksesDropdown
                              ? "0 0 0 3px rgba(14, 165, 233, 0.08)"
                              : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          minHeight: "41px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              (formData.cara_akses_id || []).length > 0
                                ? "#0f172a"
                                : "#0f172a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {(formData.cara_akses_id || []).length > 0
                            ? `${
                                (formData.cara_akses_id || []).length
                              } cara akses dipilih`
                            : "-Pilih-"}
                        </span>
                        <svg
                          style={{
                            width: "16px",
                            height: "16px",
                            transform: showCaraAksesDropdown
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s",
                            flexShrink: 0,
                          }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {showCaraAksesDropdown && (
                        <>
                          <div
                            onClick={() => setShowCaraAksesDropdown(false)}
                            style={{
                              position: "fixed",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 998,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: "4px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              backgroundColor: "#fff",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              maxHeight: "240px",
                              overflowY: "auto",
                              zIndex: 999,
                              padding: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "4px",
                              }}
                            >
                              {(master.cara_akses || [])
                                .filter(
                                  (x) =>
                                    x.status_aktif === 1 ||
                                    x.status_aktif === true,
                                )
                                .map((x) => (
                                  <label
                                    key={x.cara_akses_id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "6px 8px",
                                      cursor: "pointer",
                                      borderRadius: "6px",
                                      transition: "background-color 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#f1f5f9";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={(
                                        formData.cara_akses_id || []
                                      ).includes(String(x.cara_akses_id))}
                                      onChange={(e) => {
                                        const id = String(x.cara_akses_id);
                                        const current =
                                          formData.cara_akses_id || [];
                                        const updated = e.target.checked
                                          ? [...current, id]
                                          : current.filter(
                                              (item) => item !== id,
                                            );
                                        handleFormChange(
                                          "cara_akses_id",
                                          updated,
                                        );
                                      }}
                                      style={{
                                        width: "14px",
                                        height: "14px",
                                        marginRight: "8px",
                                        cursor: "pointer",
                                        accentColor: "#0ea5e9",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "12.5px",
                                        color: "#334155",
                                        lineHeight: "1.3",
                                      }}
                                    >
                                      {x.nama_cara_akses}
                                    </span>
                                  </label>
                                ))}
                            </div>
                            {(!master.cara_akses ||
                              master.cara_akses.filter(
                                (x) =>
                                  x.status_aktif === 1 ||
                                  x.status_aktif === true,
                              ).length === 0) && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  textAlign: "center",
                                  padding: "12px",
                                }}
                              >
                                Tidak ada data Cara Akses
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detail Teknis */}
                <div
                  style={{
                    marginBottom: "24px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "16px",
                      marginTop: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "16px",
                        background:
                          "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                        borderRadius: "2px",
                      }}
                    ></div>
                    Detail Teknis
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <div>
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
                        Frekuensi Pemakaian
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
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.frekuensi_pemakaian
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.frekuensi_pemakaian
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.frekuensi_pemakaian || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
                          )
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Status Aplikasi
                      </label>
                      <select
                        data-field="status_aplikasi"
                        value={formData.status_aplikasi}
                        onChange={(e) =>
                          handleFormChange("status_aplikasi", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.status_aplikasi
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.status_aplikasi
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.status_aplikasi || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
                          )
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

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Environment
                      </label>
                      <select
                        data-field="environment_id"
                        value={formData.environment_id}
                        onChange={(e) =>
                          handleFormChange("environment_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.environment_id
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.environment_id
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.environment || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
                          )
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        PDN Utama
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        PDN Backup
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        PIC Internal
                      </label>
                      <select
                        data-field="pic_internal"
                        value={formData.pic_internal}
                        onChange={(e) =>
                          handleFormChange("pic_internal", e.target.value)
                        }
                        disabled={!formData.eselon2_id}
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
                          backgroundColor: !formData.eselon2_id
                            ? "#f3f4f6"
                            : "#fff",
                          cursor: !formData.eselon2_id
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <option value="">
                          {!formData.eselon2_id
                            ? "Pilih Eselon 2 terlebih dahulu"
                            : "-Pilih-"}
                        </option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_internal || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        PIC Eksternal
                      </label>
                      <select
                        data-field="pic_eksternal"
                        value={formData.pic_eksternal}
                        onChange={(e) =>
                          handleFormChange("pic_eksternal", e.target.value)
                        }
                        disabled={!formData.eselon2_id}
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
                          backgroundColor: !formData.eselon2_id
                            ? "#f3f4f6"
                            : "#fff",
                          cursor: !formData.eselon2_id
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <option value="">
                          {!formData.eselon2_id
                            ? "Pilih Eselon 2 terlebih dahulu"
                            : "-Pilih-"}
                        </option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_eksternal || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true,
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Kontak PIC Internal
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Kontak PIC Eksternal
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

                  <div style={{ marginTop: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                      }}
                    >
                      Domain
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
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                      }}
                    >
                      User / Pengguna
                    </label>
                    <textarea
                      data-field="user_pengguna"
                      value={formData.user_pengguna}
                      onChange={(e) =>
                        handleFormChange("user_pengguna", e.target.value)
                      }
                      placeholder="Contoh: Pegawai internal, masyarakat umum"
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #e6eef6",
                        borderColor: fieldErrors.user_pengguna
                          ? errorBorderColor
                          : "#e6eef6",
                        boxShadow: fieldErrors.user_pengguna
                          ? errorBoxShadow
                          : "none",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                      }}
                    >
                      Data Yang Digunakan
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

                  <div style={{ marginTop: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                      }}
                    >
                      Luaran/Output
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Bahasa Pemrograman
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Basis Data
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Kerangka Pengembangan / Framework
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
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Unit Pengembang
                      </label>
                      <input
                        data-field="unit_pengembang"
                        value={formData.unit_pengembang}
                        onChange={(e) =>
                          handleFormChange("unit_pengembang", e.target.value)
                        }
                        placeholder="Contoh: Pusdatin, Tim IT Internal"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.unit_pengembang
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.unit_pengembang
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Unit Operasional Teknologi
                      </label>
                      <input
                        data-field="unit_operasional_teknologi"
                        value={formData.unit_operasional_teknologi}
                        onChange={(e) =>
                          handleFormChange(
                            "unit_operasional_teknologi",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Subbag TI, Divisi Infrastruktur"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.unit_operasional_teknologi
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.unit_operasional_teknologi
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Nilai Pengembangan Aplikasi
                      </label>
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Pusat Komputasi Utama
                      </label>
                      <input
                        data-field="pusat_komputasi_utama"
                        value={formData.pusat_komputasi_utama}
                        onChange={(e) =>
                          handleFormChange(
                            "pusat_komputasi_utama",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Data Center Jakarta"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pusat_komputasi_utama
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pusat_komputasi_utama
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Pusat Komputasi Backup
                      </label>
                      <input
                        data-field="pusat_komputasi_backup"
                        value={formData.pusat_komputasi_backup}
                        onChange={(e) =>
                          handleFormChange(
                            "pusat_komputasi_backup",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Data Center Surabaya"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.pusat_komputasi_backup
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.pusat_komputasi_backup
                            ? errorBoxShadow
                            : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Mandiri Komputasi Backup
                      </label>
                      <input
                        data-field="mandiri_komputasi_backup"
                        value={formData.mandiri_komputasi_backup}
                        onChange={(e) =>
                          handleFormChange(
                            "mandiri_komputasi_backup",
                            e.target.value,
                          )
                        }
                        placeholder="Contoh: Server Lokal Kantor"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.mandiri_komputasi_backup
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.mandiri_komputasi_backup
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Perangkat Lunak
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Cloud
                      </label>
                      <input
                        data-field="cloud"
                        value={formData.cloud}
                        onChange={(e) =>
                          handleFormChange("cloud", e.target.value)
                        }
                        placeholder="Contoh: AWS, Google Cloud, Azure"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.cloud
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.cloud
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        SSL
                      </label>
                      <input
                        data-field="ssl"
                        value={formData.ssl}
                        onChange={(e) =>
                          handleFormChange("ssl", e.target.value)
                        }
                        placeholder="Contoh: Let's Encrypt, Comodo SSL"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.ssl
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.ssl ? errorBoxShadow : "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Tanggal Expired SSL
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Antivirus
                      </label>
                      <input
                        data-field="antivirus"
                        value={formData.antivirus}
                        onChange={(e) =>
                          handleFormChange("antivirus", e.target.value)
                        }
                        placeholder="Contoh: Kaspersky, Norton, Avast"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.antivirus
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.antivirus
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Alamat IP Publik
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Keterangan
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Status BMN
                      </label>
                      <select
                        data-field="status_bmn"
                        value={formData.status_bmn}
                        onChange={(e) =>
                          handleFormChange("status_bmn", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.status_bmn
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.status_bmn
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="ya">Ya</option>
                        <option value="tidak">Tidak</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Server Aplikasi
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
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Tipe Lisensi Bahasa Pemrograman
                      </label>
                      <select
                        data-field="tipe_lisensi_bahasa"
                        value={formData.tipe_lisensi_bahasa}
                        onChange={(e) =>
                          handleFormChange(
                            "tipe_lisensi_bahasa",
                            e.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.tipe_lisensi_bahasa
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.tipe_lisensi_bahasa
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="Open Source">Open Source</option>
                        <option value="Lisensi">Lisensi</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        API Internal Sistem Integrasi
                      </label>
                      <select
                        data-field="api_internal_status"
                        value={formData.api_internal_status}
                        onChange={(e) =>
                          handleFormChange(
                            "api_internal_status",
                            e.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                          borderColor: fieldErrors.api_internal_status
                            ? errorBorderColor
                            : "#e6eef6",
                          boxShadow: fieldErrors.api_internal_status
                            ? errorBoxShadow
                            : "none",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="tersedia">Tersedia</option>
                        <option value="tidak">Tidak</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        WAF
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        VA/PT
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
                        gap: "12px",
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
                                marginBottom: "6px",
                                fontWeight: 600,
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
    </section>
  );
}

export default OperatorEselon1DataAplikasi;
