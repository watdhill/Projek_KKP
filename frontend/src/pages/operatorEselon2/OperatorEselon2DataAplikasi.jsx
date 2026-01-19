import { useState, useEffect } from "react";

function OperatorEselon2DataAplikasi() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalAppName, setOriginalAppName] = useState("");
  const [master, setMaster] = useState({});
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
  const errorBorderColor = "#dc2626";
  const errorRing = "0 0 0 3px rgba(220, 38, 38, 0.25)";
  const errorBoxShadow = errorRing;

  // Get operator's eselon1_id and eselon2_id from localStorage
  const userEselon1Id = localStorage.getItem("eselon1_id");
  const userEselon2Id = localStorage.getItem("eselon2_id");

  // fetch apps function (reusable)
  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/aplikasi");
      if (!response.ok) throw new Error("Gagal mengambil data aplikasi");
      const data = await response.json();
      // Filter hanya aplikasi dari eselon2 operator
      const filteredApps = (data.data || []).filter(
        (app) => String(app.eselon2_id) === String(userEselon2Id)
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

  const filtered = apps.filter((a) => {
    if (statusFilter !== "all") {
      const status = (a.nama_status || "").toLowerCase();
      if (status !== statusFilter) return false;
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
  };

  // Open modal and load master data
  const openModal = () => {
    fetchMasterDropdowns();
    setEditMode(false);
    setOriginalAppName("");
    setFieldErrors({});
    // Auto-set eselon1_id dan eselon2_id dari operator
    setFormData({
      nama_aplikasi: "",
      domain: "",
      deskripsi_fungsi: "",
      user_pengguna: "",
      data_digunakan: "",
      luaran_output: "",
      eselon1_id: userEselon1Id || null,
      eselon2_id: userEselon2Id || "",
      cara_akses_id: [],
      frekuensi_pemakaian: "",
      status_aplikasi: "",
      pdn_id: "",
      pdn_backup: "",
      environment_id: "",
      pic_internal: "",
      pic_eksternal: "",
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
    setShowModal(true);
  };

  // Open edit modal with pre-filled data
  const openEditModal = async (appName) => {
    try {
      fetchMasterDropdowns();
      setFieldErrors({});
      const res = await fetch(
        `http://localhost:5000/api/aplikasi/${encodeURIComponent(appName)}`
      );
      if (!res.ok) throw new Error("Gagal mengambil detail aplikasi");
      const result = await res.json();
      const app = result.data;

      // Pre-fill form with existing data
      setFormData({
        nama_aplikasi: app.nama_aplikasi || "",
        domain: app.domain || "",
        deskripsi_fungsi: app.deskripsi_fungsi || "",
        user_pengguna: app.user_pengguna || "",
        data_digunakan: app.data_digunakan || "",
        luaran_output: app.luaran_output || "",
        eselon1_id: app.eselon1_id ? String(app.eselon1_id) : "",
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
        pdn_backup: app.kode_pdn || "",
        environment_id: app.environment_id ? String(app.environment_id) : "",
        pic_internal: app.pic_internal || "",
        pic_eksternal: app.pic_eksternal || "",
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
      });

      setEditMode(true);
      setOriginalAppName(appName);
      setShowModal(true);
    } catch (err) {
      alert("Error: " + (err.message || err));
    }
  };

  const handleFormChange = (k, v) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev?.[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });

    // Conditional: WAF lainnya only when waf === 'lainnya'
    if (k === "waf" && v !== "lainnya") {
      setFormData((prev) => ({ ...prev, waf_lainnya: "" }));
      setFieldErrors((prev) => {
        if (!prev?.waf_lainnya) return prev;
        const next = { ...prev };
        delete next.waf_lainnya;
        return next;
      });
    }

    // Conditional: VA/PT waktu only when va_pt_status === 'ya'
    if (k === "va_pt_status" && v !== "ya") {
      setFormData((prev) => ({ ...prev, va_pt_waktu: "" }));
      setFieldErrors((prev) => {
        if (!prev?.va_pt_waktu) return prev;
        const next = { ...prev };
        delete next.va_pt_waktu;
        return next;
      });
    }

    // PIC rule: clear both markers when either changes
    if (k === "pic_internal" || k === "pic_eksternal") {
      setFieldErrors((prev) => {
        if (!prev?.pic_internal && !prev?.pic_eksternal) return prev;
        const next = { ...prev };
        delete next.pic_internal;
        delete next.pic_eksternal;
        return next;
      });
    }
  };

  const focusFirstInvalidField = (missingErrors, fieldOrder) => {
    const firstKey = fieldOrder.find((key) => missingErrors[key]);
    if (!firstKey) return;
    const el = document.querySelector(`[data-field="${firstKey}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      try {
        el.focus?.();
      } catch {
        // ignore
      }
    }, 200);
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
      alert("Nama Aplikasi wajib diisi");
      return;
    }

    // Cek duplikat nama aplikasi (hanya untuk mode tambah)
    if (!editMode) {
      const isDuplicate = apps.some(
        (app) =>
          app.nama_aplikasi.toLowerCase() ===
          formData.nama_aplikasi.trim().toLowerCase()
      );
      if (isDuplicate) {
        alert(
          `Nama aplikasi "${formData.nama_aplikasi}" sudah ada!\n\nSilakan gunakan nama yang berbeda.`
        );
        return;
      }
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

      const missing = [];
      const missingErrors = {};
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

        const isEmpty =
          val === null ||
          val === undefined ||
          (typeof val === "string" && val.trim() === "");
        if (isEmpty) {
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
        missingErrors.pic_internal = true;
        missingErrors.pic_eksternal = true;
        setFieldErrors(missingErrors);
        focusFirstInvalidField(missingErrors, [
          "nama_aplikasi",
          "domain",
          "deskripsi_fungsi",
          "user_pengguna",
          "data_digunakan",
          "luaran_output",
          "eselon1_id",
          "eselon2_id",
          "cara_akses_id",
          "frekuensi_pemakaian",
          "status_aplikasi",
          "pdn_id",
          "pdn_backup",
          "environment_id",
          "pic_internal",
          "pic_eksternal",
          "bahasa_pemrograman",
          "basis_data",
          "kerangka_pengembangan",
          "unit_pengembang",
          "unit_operasional_teknologi",
          "nilai_pengembangan_aplikasi",
          "pusat_komputasi_utama",
          "pusat_komputasi_backup",
          "mandiri_komputasi_backup",
          "perangkat_lunak",
          "cloud",
          "ssl",
          "alamat_ip_publik",
          "keterangan",
          "status_bmn",
          "server_aplikasi",
          "tipe_lisensi_bahasa",
          "api_internal_status",
          "waf",
          "waf_lainnya",
          "va_pt_status",
          "va_pt_waktu",
          "antivirus",
        ]);
        alert(
          "Minimal salah satu PIC (Internal atau Eksternal) harus diisi dan tidak boleh 'Tidak Ada' untuk kedua-duanya."
        );
        return false;
      }

      if (missing.length > 0) {
        setFieldErrors(missingErrors);
        focusFirstInvalidField(missingErrors, [
          "nama_aplikasi",
          "domain",
          "deskripsi_fungsi",
          "user_pengguna",
          "data_digunakan",
          "luaran_output",
          "eselon1_id",
          "eselon2_id",
          "cara_akses_id",
          "frekuensi_pemakaian",
          "status_aplikasi",
          "pdn_id",
          "pdn_backup",
          "environment_id",
          "pic_internal",
          "pic_eksternal",
          "bahasa_pemrograman",
          "basis_data",
          "kerangka_pengembangan",
          "unit_pengembang",
          "unit_operasional_teknologi",
          "nilai_pengembangan_aplikasi",
          "pusat_komputasi_utama",
          "pusat_komputasi_backup",
          "mandiri_komputasi_backup",
          "perangkat_lunak",
          "cloud",
          "ssl",
          "alamat_ip_publik",
          "keterangan",
          "status_bmn",
          "server_aplikasi",
          "tipe_lisensi_bahasa",
          "api_internal_status",
          "waf",
          "waf_lainnya",
          "va_pt_status",
          "va_pt_waktu",
          "antivirus",
        ]);
        alert("Field berikut wajib diisi:\\n- " + missing.join("\\n- "));
        return false;
      }

      setFieldErrors({});

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
          alert(
            "Alamat IP Publik tidak valid.\n\nFormat yang didukung:\n- IPv4: 192.168.1.1\n- IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334"
          );
          return false;
        }
      }
      if (
        formData.nilai_pengembangan_aplikasi &&
        formData.nilai_pengembangan_aplikasi.trim() !== ""
      ) {
        if (isNaN(Number(formData.nilai_pengembangan_aplikasi))) {
          alert("Nilai Pengembangan Aplikasi harus berupa angka");
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
        environment_id: formData.environment_id || null,
        pic_internal: formData.pic_internal || null,
        pic_eksternal: formData.pic_eksternal || null,
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

      const url = editMode
        ? `http://localhost:5000/api/aplikasi/${encodeURIComponent(
            originalAppName
          )}`
        : "http://localhost:5000/api/aplikasi";
      const method = editMode ? "PUT" : "POST";

      console.log("Payload being sent:", payload);
      console.log("URL:", url, "Method:", method);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      console.log("Response status:", res.status);
      console.log("Response data:", result);

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
      alert(
        editMode
          ? "Aplikasi berhasil diupdate"
          : "Aplikasi berhasil ditambahkan"
      );
    } catch (err) {
      console.error("Full error:", err);
      const errorMsg = err?.message || String(err);
      const status = err?.status;
      const payload = err?.payload;
      const serverError = payload?.error;
      const serverCode = payload?.code;

      // Handle specific error types
      if (
        status === 409 ||
        serverCode === "DUPLICATE_NAMA_APLIKASI" ||
        (errorMsg.includes("Duplicate entry") &&
          errorMsg.includes("PRIMARY")) ||
        (typeof serverError === "string" &&
          serverError.includes("Duplicate entry") &&
          serverError.includes("PRIMARY"))
      ) {
        alert(
          "Nama aplikasi sudah ada di database!\n\n" +
            "Silakan gunakan nama yang berbeda atau edit aplikasi yang sudah ada."
        );
      } else {
        alert(
          "Error: " +
            errorMsg +
            "\n\nSilakan cek browser console (F12) untuk detail lengkap"
        );
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
              Kelola aplikasi yang berada di bawah unit Eselon 2 Anda
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
          background: "#fff",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
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
              outline: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#4f46e5";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(79, 70, 229, 0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "9px 36px 9px 14px",
            borderRadius: "10px",
            border: "1.5px solid #e2e8f0",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            background: `url('data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\'/%3E%3C/svg%3E') no-repeat right 14px center, #fff`,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(79, 70, 229, 0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
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
            padding: "6px 14px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            border: "1px solid #c7d2fe",
            fontSize: "11px",
            fontWeight: 600,
            color: "#4338ca",
            letterSpacing: "0.025em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#4f46e5",
              display: "inline-block",
            }}
          />
          {filtered.length} Aplikasi
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
            padding: "48px 24px",
            textAlign: "center",
            background: "linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)",
            borderRadius: "14px",
            border: "1.5px solid #f1f5f9",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #e0f2fe",
              borderTop: "3px solid #0ea5e9",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            Memuat data aplikasi...
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1.5px solid #f1f5f9",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
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
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
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
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
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
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
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
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
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
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: "11px",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 700,
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
                        borderBottom: "1.5px solid #f1f5f9",
                        background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        height: "80px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#eef2ff";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(79, 70, 229, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          i % 2 === 0 ? "#ffffff" : "#fafbfc";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          fontWeight: 700,
                          color: "#64748b",
                          fontSize: "12px",
                          verticalAlign: "middle",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "13px",
                            marginBottom: "2px",
                          }}
                        >
                          {app.nama_aplikasi || "-"}
                        </div>
                        {app.domain && (
                          <a
                            href={
                              app.domain.startsWith("http")
                                ? app.domain
                                : `https://${app.domain}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              color: "#0ea5e9",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "4px",
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
                                d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                            {app.domain}
                          </a>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "#475569",
                          fontSize: "13px",
                          verticalAlign: "middle",
                        }}
                      >
                        {unit}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "#475569",
                          fontSize: "13px",
                          verticalAlign: "middle",
                        }}
                      >
                        {pic}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontWeight: 700,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
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
                            onClick={() => openEditModal(app.nama_aplikasi)}
                            title="Edit"
                            style={{
                              padding: "7px 9px",
                              background:
                                "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition:
                                "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(245, 158, 11, 0.3)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(245, 158, 11, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 6px rgba(245, 158, 11, 0.3)";
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
                                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                stroke="#ffffff"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          padding: "10px 14px",
          background: "linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)",
          borderRadius: "10px",
          border: "1.5px solid #f1f5f9",
          color: "#64748b",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <span style={{ color: "#0f172a" }}>Total:</span> {filtered.length}{" "}
        aplikasi ditampilkan
      </div>

      {/* Modal for input/edit */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(2, 6, 23, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                padding: "18px 22px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {editMode ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "17px",
                    fontWeight: 700,
                  }}
                >
                  {editMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
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
                    d="M18 6L6 18M6 6L18 18"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              <form onSubmit={handleSubmitForm}>
                {/* SECTION: Informasi Dasar */}
                <div
                  style={{
                    marginBottom: "24px",
                    paddingBottom: "24px",
                    borderBottom: "1.5px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "20px",
                        background:
                          "linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)",
                        borderRadius: "2px",
                      }}
                    />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0f172a",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Informasi Dasar
                    </h3>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#475569",
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
                        borderRadius: "10px",
                        border: "1.5px solid #e2e8f0",
                        borderColor: fieldErrors.nama_aplikasi
                          ? errorBorderColor
                          : "#e2e8f0",
                        fontSize: "13px",
                        outline: "none",
                        backgroundColor: "#fafbfc",
                        boxShadow: fieldErrors.nama_aplikasi
                          ? errorBoxShadow
                          : "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          fieldErrors.nama_aplikasi
                            ? errorBorderColor
                            : "#e2e8f0";
                        e.currentTarget.style.boxShadow =
                          fieldErrors.nama_aplikasi ? errorBoxShadow : "none";
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Deskripsi dan Fungsi Aplikasi
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
                        borderRadius: "10px",
                        border: "1.5px solid #e2e8f0",
                        borderColor: fieldErrors.deskripsi_fungsi
                          ? errorBorderColor
                          : "#e2e8f0",
                        fontSize: "13px",
                        outline: "none",
                        backgroundColor: "#fafbfc",
                        resize: "vertical",
                        boxShadow: fieldErrors.deskripsi_fungsi
                          ? errorBoxShadow
                          : "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          fieldErrors.deskripsi_fungsi
                            ? errorBorderColor
                            : "#e2e8f0";
                        e.currentTarget.style.boxShadow =
                          fieldErrors.deskripsi_fungsi
                            ? errorBoxShadow
                            : "none";
                      }}
                    />
                  </div>
                </div>

                {/* SECTION: Lokasi & Penggunaan */}
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
                            ? errorBoxShadow
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
                            fieldErrors.eselon1_id ? errorBoxShadow : "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.eselon1 || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true
                          )
                          .map((x) => (
                            <option key={x.eselon1_id} value={x.eselon1_id}>
                              {x.nama_eselon1}
                            </option>
                          ))}
                      </select>
                    </div>

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
                        Eselon 2
                      </label>
                      <select
                        data-field="eselon2_id"
                        value={formData.eselon2_id}
                        onChange={(e) =>
                          handleFormChange("eselon2_id", e.target.value)
                        }
                        disabled
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          borderColor: fieldErrors.eselon2_id
                            ? errorBorderColor
                            : "#e2e8f0",
                          fontSize: "13px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#fafbfc",
                          boxShadow: fieldErrors.eselon2_id
                            ? errorBoxShadow
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
                            fieldErrors.eselon2_id
                              ? errorBorderColor
                              : "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#fafbfc";
                          e.currentTarget.style.boxShadow =
                            fieldErrors.eselon2_id ? errorBoxShadow : "none";
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.eselon2 || [])
                          .filter(
                            (x) =>
                              (x.status_aktif === 1 ||
                                x.status_aktif === true) &&
                              (!formData.eselon1_id ||
                                String(x.eselon1_id) ===
                                  String(formData.eselon1_id))
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
                          marginBottom: "7px",
                          fontWeight: 600,
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Cara Akses Aplikasi
                      </label>
                      <div
                        data-field="cara_akses_id"
                        onClick={() =>
                          setShowCaraAksesDropdown(!showCaraAksesDropdown)
                        }
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowCaraAksesDropdown((s) => !s);
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
                          borderColor: showCaraAksesDropdown
                            ? "#0ea5e9"
                            : "#e2e8f0",
                          boxShadow: showCaraAksesDropdown
                            ? "0 0 0 3px rgba(14, 165, 233, 0.08)"
                            : "none",
                          ...(fieldErrors.cara_akses_id
                            ? {
                                borderColor: errorBorderColor,
                                boxShadow: errorBoxShadow,
                              }
                            : null),
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
                                    x.status_aktif === true
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
                                              (item) => item !== id
                                            );
                                        handleFormChange(
                                          "cara_akses_id",
                                          updated
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
                                  x.status_aktif === true
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
                            e.target.value
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
                              x.status_aktif === 1 || x.status_aktif === true
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
                              x.status_aktif === 1 || x.status_aktif === true
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
                              x.status_aktif === 1 || x.status_aktif === true
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
                        onChange={(e) => {
                          const id = e.target.value;
                          handleFormChange("pdn_id", id);
                          const pdnObj = (master.pdn || [])
                            .filter(
                              (p) =>
                                p.status_aktif === 1 || p.status_aktif === true
                            )
                            .find((p) => String(p.pdn_id) === String(id));
                          handleFormChange(
                            "pdn_backup",
                            pdnObj ? pdnObj.kode_pdn : ""
                          );
                        }}
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
                              x.status_aktif === 1 || x.status_aktif === true
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
                      <input
                        data-field="pdn_backup"
                        value={formData.pdn_backup}
                        readOnly
                        placeholder="Auto-fill dari PDN Utama"
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
                          backgroundColor: "#f8fafc",
                          cursor: "not-allowed",
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
                        PIC Internal
                      </label>
                      <select
                        data-field="pic_internal"
                        value={formData.pic_internal}
                        onChange={(e) =>
                          handleFormChange("pic_internal", e.target.value)
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
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_internal || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true
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
                        }}
                      >
                        <option value="">-Pilih-</option>
                        <option value="Tidak Ada">Tidak Ada</option>
                        {(master.pic_eksternal || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                            e.target.value
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
                    onClick={() => {
                      setShowModal(false);
                      setFieldErrors({});
                      setShowCaraAksesDropdown(false);
                    }}
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "6px", verticalAlign: "middle" }}
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
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
                      gap: "6px",
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
                    {submitting
                      ? "Menyimpan..."
                      : editMode
                      ? "Simpan Perubahan"
                      : "Tambah Aplikasi"}
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
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Konfirmasi Penyimpanan
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                Apakah Anda yakin semua data aplikasi yang diinput sudah benar
                dan siap untuk disimpan?
              </p>
            </div>
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#64748b",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                Periksa Kembali
              </button>
              <button
                onClick={handleConfirmSave}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(16, 185, 129, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(16, 185, 129, 0.3)";
                }}
              >
                Ya, Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OperatorEselon2DataAplikasi;
