import { useState, useEffect } from "react";

function OperatorEselon1DataAplikasi() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalAppName, setOriginalAppName] = useState("");
  const [master, setMaster] = useState({});
  const [formData, setFormData] = useState({
    nama_aplikasi: "",
    domain: "",
    deskripsi_fungsi: "",
    user_pengguna: "",
    data_digunakan: "",
    luaran_output: "",
    eselon1_id: "",
    eselon2_id: "",
    cara_akses_id: "",
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

  // Get operator's eselon1_id from localStorage
  const userEselon1Id = localStorage.getItem("eselon1_id");

  // fetch apps function (reusable)
  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/aplikasi");
      if (!response.ok) throw new Error("Gagal mengambil data aplikasi");
      const data = await response.json();
      // Filter hanya aplikasi dari eselon1 operator
      const filteredApps = (data.data || []).filter(
        (app) => String(app.eselon1_id) === String(userEselon1Id)
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
    // Auto-set eselon1_id dari operator
    setFormData({
      nama_aplikasi: "",
      domain: "",
      deskripsi_fungsi: "",
      user_pengguna: "",
      data_digunakan: "",
      luaran_output: "",
      eselon1_id: userEselon1Id || "",
      eselon2_id: "",
      cara_akses_id: "",
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
        cara_akses_id: app.cara_akses_id ? String(app.cara_akses_id) : "",
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

  const handleFormChange = (k, v) =>
    setFormData((prev) => ({ ...prev, [k]: v }));

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nama_aplikasi || formData.nama_aplikasi.trim() === "") {
      alert("Nama Aplikasi wajib diisi");
      return;
    }

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
      for (const key of Object.keys(fieldLabels)) {
        const val = formData[key];
        // waf_lainnya only required when waf === 'lainnya'
        if (key === "waf_lainnya") continue;
        // va_pt_waktu only required when va_pt_status === 'ya'
        if (key === "va_pt_waktu") continue;
        if (
          val === null ||
          val === undefined ||
          (typeof val === "string" && val.trim() === "")
        ) {
          missing.push(fieldLabels[key]);
        }
      }

      // Conditional checks
      if (formData.waf === "lainnya") {
        if (!formData.waf_lainnya || formData.waf_lainnya.trim() === "")
          missing.push(fieldLabels["waf_lainnya"]);
      }
      if (formData.va_pt_status === "ya") {
        if (!formData.va_pt_waktu || formData.va_pt_waktu.trim() === "")
          missing.push(fieldLabels["va_pt_waktu"]);
      }

      if (missing.length > 0) {
        alert("Field berikut wajib diisi:\n- " + missing.join("\n- "));
        return;
      }

      // Additional client-side validation
      if (
        formData.alamat_ip_publik &&
        formData.alamat_ip_publik.trim() !== ""
      ) {
        const ipRegex =
          /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
        if (!ipRegex.test(formData.alamat_ip_publik.trim())) {
          alert(
            "Alamat IP Publik tidak valid. Gunakan format IPv4 seperti 192.168.0.1"
          );
          return;
        }
      }
      if (
        formData.nilai_pengembangan_aplikasi &&
        formData.nilai_pengembangan_aplikasi.trim() !== ""
      ) {
        if (isNaN(Number(formData.nilai_pengembangan_aplikasi))) {
          alert("Nilai Pengembangan Aplikasi harus berupa angka");
          return;
        }
      }

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
        cara_akses_id: formData.cara_akses_id || null,
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Gagal menyimpan aplikasi");
      // refresh list
      await fetchApps();
      setShowModal(false);
      alert(
        editMode
          ? "Aplikasi berhasil diupdate"
          : "Aplikasi berhasil ditambahkan"
      );
    } catch (err) {
      alert("Error: " + (err.message || err));
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
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            Data Aplikasi
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
            Kelola aplikasi milik unit Eselon 1 Anda
          </p>
        </div>
        <button
          onClick={openModal}
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            color: "#fff",
            padding: "9px 18px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(14, 165, 233, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(14, 165, 233, 0.3)";
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
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span>Input Aplikasi</span>
        </button>
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
              left: "12px",
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
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama aplikasi, PIC, atau unit..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0ea5e9";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(14, 165, 233, 0.1)";
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
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #e6eef6",
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
            padding: "8px 14px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "1px solid #bae6fd",
            fontSize: "12px",
            fontWeight: 600,
            color: "#0369a1",
            whiteSpace: "nowrap",
          }}
        >
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
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
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
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
                  const pic = app.pic_internal || app.pic_eksternal || "-";
                  return (
                    <tr
                      key={app.nama_aplikasi ?? i}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s ease",
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
                          padding: "14px 16px",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#64748b",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            fontWeight: 600,
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
                              fontSize: "12px",
                              color: "#2563eb",
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
                            <span>{app.domain}</span>
                          </a>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        {unit}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        {pic}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 12px",
                            borderRadius: "12px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontWeight: 600,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.025em",
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => openEditModal(app.nama_aplikasi)}
                          title="Edit"
                          style={{
                            padding: "6px 12px",
                            background:
                              "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            border: "1px solid #fcd34d",
                            borderRadius: "7px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#92400e",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(251, 191, 36, 0.3)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
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
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
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
              <h2
                style={{
                  margin: 0,
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {editMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
              </h2>
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
                        fontSize: "13px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        backgroundColor: "#fafbfc",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#fafbfc";
                        e.currentTarget.style.boxShadow = "none";
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
                        fontSize: "13px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        fontFamily: "inherit",
                        resize: "vertical",
                        backgroundColor: "#fafbfc",
                        lineHeight: "1.6",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#0ea5e9";
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(14, 165, 233, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#fafbfc";
                        e.currentTarget.style.boxShadow = "none";
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
                          fontSize: "13px",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          outline: "none",
                          cursor: "pointer",
                          backgroundColor: "#fafbfc",
                        }}
                        disabled
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#0ea5e9";
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(14, 165, 233, 0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#fafbfc";
                          e.currentTarget.style.boxShadow = "none";
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
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Eselon 2
                      </label>
                      <select
                        value={formData.eselon2_id}
                        onChange={(e) =>
                          handleFormChange("eselon2_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Cara Akses
                      </label>
                      <select
                        value={formData.cara_akses_id}
                        onChange={(e) =>
                          handleFormChange("cara_akses_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
                        }}
                      >
                        <option value="">-Pilih-</option>
                        {(master.cara_akses || [])
                          .filter(
                            (x) =>
                              x.status_aktif === 1 || x.status_aktif === true
                          )
                          .map((x) => (
                            <option
                              key={x.cara_akses_id}
                              value={x.cara_akses_id}
                            >
                              {x.nama_cara_akses}
                            </option>
                          ))}
                      </select>
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
                        value={formData.status_aplikasi}
                        onChange={(e) =>
                          handleFormChange("status_aplikasi", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        value={formData.environment_id}
                        onChange={(e) =>
                          handleFormChange("environment_id", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        value={formData.pdn_backup}
                        readOnly
                        placeholder="Auto-fill dari PDN Utama"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                      <input
                        value={formData.pic_internal}
                        onChange={(e) =>
                          handleFormChange("pic_internal", e.target.value)
                        }
                        placeholder="Contoh: Budi Santoso"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        PIC Eksternal
                      </label>
                      <input
                        value={formData.pic_eksternal}
                        onChange={(e) =>
                          handleFormChange("pic_eksternal", e.target.value)
                        }
                        placeholder="Contoh: PT Telkom Indonesia"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        value={formData.alamat_ip_publik}
                        onChange={(e) =>
                          handleFormChange("alamat_ip_publik", e.target.value)
                        }
                        placeholder="Contoh: 192.168.1.100"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        Keterangan
                      </label>
                      <input
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
                        value={formData.status_bmn}
                        onChange={(e) =>
                          handleFormChange("status_bmn", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                        value={formData.server_aplikasi}
                        onChange={(e) =>
                          handleFormChange("server_aplikasi", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e6eef6",
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
                          value={formData.waf}
                          onChange={(e) =>
                            handleFormChange("waf", e.target.value)
                          }
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                          }}
                        >
                          <option value="">-Pilih-</option>
                          <option value="ya">Ya</option>
                          <option value="tidak">Tidak</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                        {formData.waf === "lainnya" && (
                          <input
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
                          value={formData.va_pt_status}
                          onChange={(e) =>
                            handleFormChange("va_pt_status", e.target.value)
                          }
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #e6eef6",
                          }}
                        >
                          <option value="">-Pilih-</option>
                          <option value="ya">Ya</option>
                          <option value="tidak">Tidak</option>
                        </select>
                        {formData.va_pt_status === "ya" && (
                          <input
                            type="date"
                            value={formData.va_pt_waktu}
                            onChange={(e) =>
                              handleFormChange("va_pt_waktu", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #e6eef6",
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
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      fontSize: "13px",
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
                      padding: "9px 24px",
                      borderRadius: "8px",
                      border: "none",
                      background: submitting
                        ? "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)"
                        : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: submitting
                        ? "none"
                        : "0 4px 12px rgba(14, 165, 233, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseOver={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 16px rgba(14, 165, 233, 0.4)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(14, 165, 233, 0.3)";
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <svg
                          width="16"
                          height="16"
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
                          width="16"
                          height="16"
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
    </section>
  );
}

export default OperatorEselon1DataAplikasi;
