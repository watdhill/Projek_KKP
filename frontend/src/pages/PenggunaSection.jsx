import { useState, useEffect } from "react";

function PenggunaSection() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [eselon1List, setEselon1List] = useState([]);
  const [eselon2List, setEselon2List] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEselon1, setFilterEselon1] = useState("");
  const [filterEselon2, setFilterEselon2] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    email: "",
    jabatan: "",
    kontak: "",
    password: "",
    role_id: "",
    eselon1_id: "",
    eselon2_id: "",
    status_aktif: 1,
  });
  const [operatorType, setOperatorType] = useState("eselon1");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMasterData();
  }, []);

  // Filter users based on search and criteria
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(user => 
        user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nip?.includes(searchTerm) ||
        user.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEselon1) {
      result = result.filter(user => user.eselon1_id === parseInt(filterEselon1));
    }

    if (filterEselon2) {
      result = result.filter(user => user.eselon2_id === parseInt(filterEselon2));
    }

    setFilteredUsers(result);
  }, [searchTerm, filterEselon1, filterEselon2, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error("Gagal mengambil data pengguna");
      const data = await response.json();
      setUsers(data.data || []);
      setFilteredUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/master-data/dropdown");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRoles(result.data.roles || []);
          setEselon1List(result.data.eselon1 || []);
          setEselon2List(result.data.eselon2 || []);
        }
      }
    } catch (err) {
      console.log("Info: Master data tidak tersedia");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nip") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 18);
      setFormData((prev) => ({ ...prev, nip: digitsOnly }));
      return;
    }

    if (name === "role_id") {
      const selectedRole = roles.find((r) => r.role_id === parseInt(value));
      const roleName = selectedRole?.nama_role || "";

      if (roleName.includes("Eselon 1")) {
        setOperatorType("eselon1");
        setFormData((prev) => ({
          ...prev,
          role_id: value,
          eselon1_id: "",
          eselon2_id: "",
        }));
      } else if (roleName.includes("Eselon 2")) {
        setOperatorType("eselon2");
        setFormData((prev) => ({
          ...prev,
          role_id: value,
          eselon1_id: "",
          eselon2_id: "",
        }));
      } else {
        setOperatorType("none");
        setFormData((prev) => ({
          ...prev,
          role_id: value,
          eselon1_id: "",
          eselon2_id: "",
        }));
      }
    } else if (name === "eselon1_id") {
      setFormData((prev) => ({ ...prev, eselon1_id: value, eselon2_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.nama || !formData.email || !formData.jabatan || !formData.kontak || !formData.role_id) {
      return "Semua field wajib diisi";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Format email tidak valid";
    }
    if (!formData.email.endsWith("@kkp.go.id")) {
      return "Email harus menggunakan domain @kkp.go.id";
    }

    if (formData.nip && formData.nip.length !== 18) {
      return "NIP harus 18 digit";
    }

    if (!isEditMode || formData.password) {
      if (!formData.password && !isEditMode) {
        return "Password harus diisi";
      }
      if (formData.password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          return "Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)";
        }
      }
    }

    return null;
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({
      nama: user.nama || "",
      nip: user.nip || "",
      email: user.email || "",
      jabatan: user.jabatan || "",
      kontak: user.kontak || "",
      password: "",
      role_id: user.role_id || "",
      eselon1_id: user.eselon1_id || "",
      eselon2_id: user.eselon2_id || "",
      status_aktif: user.status_aktif !== undefined ? user.status_aktif : 1,
    });

    const selectedRole = roles.find((r) => r.role_id === user.role_id);
    const roleName = selectedRole?.nama_role || "";
    if (roleName.includes("Eselon 1")) {
      setOperatorType("eselon1");
    } else if (roleName.includes("Eselon 2")) {
      setOperatorType("eselon2");
    } else {
      setOperatorType("none");
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/users/${selectedUser.user_id}`
        : "http://localhost:5000/api/users";

      const method = isEditMode ? "PUT" : "POST";

      const payload = {
        ...formData,
        role_id: parseInt(formData.role_id),
        eselon1_id: formData.eselon1_id ? parseInt(formData.eselon1_id) : null,
        eselon2_id: formData.eselon2_id ? parseInt(formData.eselon2_id) : null,
        status_aktif: parseInt(formData.status_aktif),
      };

      if (isEditMode && !formData.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Gagal ${isEditMode ? "mengupdate" : "menambah"} pengguna`
        );
      }

      setSubmitSuccess(true);
      setFormData({
        nama: "",
        nip: "",
        email: "",
        jabatan: "",
        kontak: "",
        password: "",
        role_id: "",
        eselon1_id: "",
        eselon2_id: "",
        status_aktif: 1,
      });
      setOperatorType("eselon1");

      setTimeout(() => {
        setShowModal(false);
        setIsEditMode(false);
        setSelectedUser(null);
        fetchUsers();
      }, 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      nama: "",
      nip: "",
      email: "",
      jabatan: "",
      kontak: "",
      password: "",
      role_id: "",
      eselon1_id: "",
      eselon2_id: "",
      status_aktif: 1,
    });
    setOperatorType("eselon1");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterEselon1("");
    setFilterEselon2("");
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const clampStyle = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.4,
  };

  return (
    <section id="pengguna" className="page-section" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, marginBottom: "4px", fontSize: "24px", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.025em" }}>Kelola Pengguna</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px", fontWeight: 400 }}>Daftar pengguna sistem dan manajemen akses</p>
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", marginBottom: "16px", fontSize: "14px" }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
          <div style={{ marginTop: "12px" }}>Memuat data...</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter Section Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", maxWidth: "100%" }}>
            <div style={{ padding: "16px 18px", backgroundColor: "#fafbfc", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: "12px", alignItems: "end", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#475569", fontSize: "12px" }}>Cari Pengguna</label>
                  <input type="text" placeholder="Cari nama, email, NIP, atau jabatan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#475569", fontSize: "12px" }}>Eselon 1</label>
                  <select value={filterEselon1} onChange={(e) => { setFilterEselon1(e.target.value); setFilterEselon2(""); }} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}>
                    <option value="">Semua</option>
                    {eselon1List.map((e1) => (<option key={e1.eselon1_id} value={e1.eselon1_id}>{e1.nama_eselon1}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#475569", fontSize: "12px" }}>Eselon 2/UPT</label>
                  <select value={filterEselon2} onChange={(e) => setFilterEselon2(e.target.value)} disabled={!filterEselon1} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: !filterEselon1 ? "#f1f5f9" : "#ffffff", cursor: !filterEselon1 ? "not-allowed" : "pointer" }}>
                    <option value="">Semua</option>
                    {eselon2List.filter((e2) => !filterEselon1 || e2.eselon1_id === parseInt(filterEselon1)).map((e2) => (<option key={e2.eselon2_id} value={e2.eselon2_id}>{e2.nama_eselon2}</option>))}
                  </select>
                </div>
                <button onClick={resetFilters} style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>Reset</button>
                <button onClick={() => setShowModal(true)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Tambah
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan {filteredUsers.length} dari {users.length} pengguna</div>
            </div>
          </div>

          {/* Table Card */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", maxWidth: "100%", overflow: "hidden" }}>
              {filteredUsers.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "14px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                <div style={{ fontWeight: 500 }}>Tidak ada data ditemukan</div>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  width: "100%",
                  maxHeight: "calc(100vh - 320px)",
                }}
              >
                <table style={{ width: "100%", minWidth: "1800px", borderCollapse: "collapse", fontSize: "13px", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", height: "44px" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "6%" }}>No</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "15%" }}>Email</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "12%" }}>Nama</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "15%" }}>Eselon 1</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "15%" }}>Eselon 2/UPT</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "12%" }}>NIP</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "10%" }}>Jabatan</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "9%" }}>Kontak</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "8%" }}>Role</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "8%" }}>Status</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", width: "6%" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.user_id} style={{ borderBottom: "1px solid #e2e8f0", minHeight: "48px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}>
                      <td style={{ padding: "10px 12px", color: "#64748b", fontWeight: 500, width: "6%", verticalAlign: "middle" }}>{index + 1}</td>
                      <td style={{ padding: "10px 12px", color: "#1e293b", fontWeight: 500, width: "15%", verticalAlign: "middle" }}><div style={{ ...clampStyle, textTransform: "none" }}>{user.email || "-"}</div></td>
                      <td style={{ padding: "10px 12px", color: "#1e293b", width: "12%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.nama || "-").toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", color: "#64748b", fontSize: "12px", width: "15%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.nama_eselon1 || "-").toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", color: "#64748b", fontSize: "12px", width: "15%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.nama_eselon2 || "-").toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", color: "#64748b", width: "12%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.nip || "-").toString().toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", color: "#64748b", width: "10%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.jabatan || "-").toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", color: "#64748b", width: "9%", verticalAlign: "middle" }}><div style={clampStyle}>{(user.kontak || "-").toString().toUpperCase()}</div></td>
                      <td style={{ padding: "10px 12px", width: "8%", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: user.nama_role === "Admin" ? "#dbeafe" : "#dcfce7", color: user.nama_role === "Admin" ? "#075985" : "#166534", textTransform: "uppercase" }}>
                          {user.nama_role || "-"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", width: "8%", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.01em", backgroundColor: user.status_aktif === 1 ? "#e7f8ee" : "#fde8e8", color: user.status_aktif === 1 ? "#15803d" : "#b91c1c" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: user.status_aktif === 1 ? "#22c55e" : "#dc2626" }}></span>
                          <span style={{ textTransform: "uppercase" }}>{user.status_aktif === 1 ? "Aktif" : "Nonaktif"}</span>
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", width: "6%", verticalAlign: "middle" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 14px",
                            background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(249, 115, 22, 0.25)",
                            letterSpacing: "0.01em"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)", padding: "28px", maxWidth: "400px", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>?</span>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>Konfirmasi {isEditMode ? "Update" : "Tambah"} Pengguna</h3>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "14px" }}>Apakah Anda yakin ingin {isEditMode ? "mengupdate" : "menambah"} pengguna ini?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" onClick={handleCancelConfirmation} disabled={submitting} style={{ padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "13px", opacity: submitting ? 0.6 : 1, minWidth: "100px" }}>
                Tidak
              </button>
              <button type="button" onClick={handleConfirmSubmit} disabled={submitting} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "13px", opacity: submitting ? 0.7 : 1, boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)", minWidth: "100px" }}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)", maxWidth: "650px", width: "90%", maxHeight: "90vh", overflow: "auto", padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isEditMode ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isEditMode ? (<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>) : (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>)}
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1e293b" }}>{isEditMode ? "Edit Akun Pengguna" : "Tambah Akun Baru"}</h2>
            </div>

            {submitError && <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", marginBottom: "16px", fontSize: "14px" }}>⚠️ {submitError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="nama@kkp.go.id" style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Harus menggunakan domain @kkp.go.id</div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required placeholder="Nama lengkap" style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Role <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="role_id" value={formData.role_id} onChange={handleInputChange} required style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}>
                  <option value="">-- Pilih Role --</option>
                  {roles.map((role) => (<option key={role.role_id} value={role.role_id}>{role.nama_role}</option>))}
                </select>
              </div>

              {(operatorType === "eselon1" || operatorType === "eselon2") && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Unit Eselon 1 <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="eselon1_id" value={formData.eselon1_id} onChange={handleInputChange} required style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}>
                    <option value="">-- Pilih Unit Eselon 1 --</option>
                    {eselon1List.map((e1) => (<option key={e1.eselon1_id} value={e1.eselon1_id}>{e1.nama_eselon1}</option>))}
                  </select>
                </div>
              )}

              {operatorType === "eselon2" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Unit Eselon 2/UPT <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="eselon2_id" value={formData.eselon2_id} onChange={handleInputChange} required disabled={!formData.eselon1_id} style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: !formData.eselon1_id ? "#f1f5f9" : "#ffffff", cursor: !formData.eselon1_id ? "not-allowed" : "pointer" }}>
                    <option value="">{!formData.eselon1_id ? "-- Pilih Eselon 1 terlebih dahulu --" : "-- Pilih Unit Eselon 2/UPT --"}</option>
                    {eselon2List.filter((e2) => !formData.eselon1_id || e2.eselon1_id === parseInt(formData.eselon1_id)).map((e2) => (<option key={e2.eselon2_id} value={e2.eselon2_id}>{e2.nama_eselon2}</option>))}
                  </select>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>UPT setara dengan Eselon 2 di bawah Eselon 1</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>NIP</label>
                  <input type="text" name="nip" value={formData.nip} onChange={handleInputChange} placeholder="18 digit angka" maxLength="18" style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{formData.nip.length}/18 digit</div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Jabatan <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" name="jabatan" value={formData.jabatan} onChange={handleInputChange} required placeholder="Posisi jabatan" style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Kontak <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" name="kontak" value={formData.kontak} onChange={handleInputChange} required placeholder="Nomor telepon/HP" style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Password {isEditMode ? "(Kosongkan jika tidak diubah)" : ""} {!isEditMode && <span style={{ color: "#ef4444" }}>*</span>}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditMode}
                      placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Min 8 karakter"}
                      style={{ flex: 1, padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                      style={{ padding: "8px 10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#475569", borderRadius: "6px", cursor: "pointer", minWidth: "42px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.06-3.02 3.29-5.5 6.06-6.88" />
                          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.35 11.35 0 0 1-2.1 3.36" />
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Min 8 karakter: wajib ada huruf besar, huruf kecil, angka, dan simbol apa saja (tanpa spasi)</div>
                </div>
              </div>

              {isEditMode && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Status Pengguna <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="status_aktif" value={formData.status_aktif} onChange={handleInputChange} required style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}>
                    <option value={1}>Aktif</option>
                    <option value={0}>Nonaktif</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" onClick={handleCloseModal} disabled={submitting} style={{ padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "13px", opacity: submitting ? 0.6 : 1 }}>Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "13px", opacity: submitting ? 0.7 : 1, boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)" }}>
                  {submitting ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default PenggunaSection;
