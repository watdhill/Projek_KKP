import { useState, useEffect } from "react";

function PenggunaSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [eselon1List, setEselon1List] = useState([]);
  const [eselon2List, setEselon2List] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    email: "",
    jabatan: "",
    password: "",
    role_id: "",
    eselon1_id: "",
    eselon2_id: "",
    status_aktif: 1,
  });
  const [operatorType, setOperatorType] = useState("eselon1"); // Track operator selection
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users
  useEffect(() => {
    fetchUsers();
    fetchMasterData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error("Gagal mengambil data pengguna");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master data (roles, eselon)
  const fetchMasterData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/master-data/dropdown"
      );
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

    // Jika role berubah, reset eselon fields dan tentukan operator type
    if (name === "role_id") {
      const selectedRole = roles.find((r) => r.role_id === parseInt(value));
      const roleName = selectedRole?.nama_role || "";

      // Tentukan operator type berdasarkan role
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
        // Admin - no eselon needed
        setOperatorType("none");
        setFormData((prev) => ({
          ...prev,
          role_id: value,
          eselon1_id: "",
          eselon2_id: "",
        }));
      }
    } else if (name === "eselon1_id") {
      // Jika eselon1 berubah, reset eselon2
      setFormData((prev) => ({ ...prev, eselon1_id: value, eselon2_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);

    // Set form data dengan data user yang dipilih
    setFormData({
      nama: user.nama || "",
      nip: user.nip || "",
      email: user.email || "",
      jabatan: user.jabatan || "",
      password: "", // Password kosong saat edit
      role_id: user.role_id || "",
      eselon1_id: user.eselon1_id || "",
      eselon2_id: user.eselon2_id || "",
      status_aktif: user.status_aktif !== undefined ? user.status_aktif : 1,
    });

    // Set operator type berdasarkan role
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
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/users/${selectedUser.user_id}`
        : "http://localhost:5000/api/users";

      const method = isEditMode ? "PUT" : "POST";

      // Jika edit dan password kosong, jangan kirim password
      const payload = {
        ...formData,
        role_id: parseInt(formData.role_id),
        eselon1_id: formData.eselon1_id ? parseInt(formData.eselon1_id) : null,
        eselon2_id: formData.eselon2_id ? parseInt(formData.eselon2_id) : null,
        status_aktif: parseInt(formData.status_aktif),
      };

      if (isEditMode && !formData.password) {
        delete payload.password; // Hapus password dari payload jika kosong saat edit
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Gagal ${isEditMode ? "mengupdate" : "menambah"} pengguna`
        );
      }

      setSubmitSuccess(true);
      setFormData({
        nama: "",
        nip: "",
        email: "",
        jabatan: "",
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

  return (
    <section
      id="pengguna"
      className="page-section"
      style={{ maxWidth: "100%", overflowX: "hidden" }}
    >
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
            Kelola Pengguna
          </h1>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13.5px",
              fontWeight: 400,
            }}
          >
            Daftar pengguna sistem dan manajemen akses
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#991b1b",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

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
      ) : users.length === 0 ? (
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
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
          <div style={{ fontWeight: 500 }}>Belum ada data pengguna</div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            Klik tombol "Tambah Pengguna" untuk menambahkan pengguna baru
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            maxWidth: "100%",
            overflow: "hidden",
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
                Daftar Pengguna
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                Total: {users.length} pengguna
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
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
              Tambah Pengguna
            </button>
          </div>
          {/* Table Scroll Wrapper */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              width: "100%",
              display: "block",
            }}
          >
            <table
              style={{
                width: "1200px",
                minWidth: "1200px",
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
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "50px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "150px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Nama
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "120px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    NIP
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "200px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "150px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Jabatan
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "130px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "180px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Eselon
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "100px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      minWidth: "100px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "all 0.15s ease",
                      height: "50px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ffffff")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontWeight: 500,
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {user.nama || "-"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.nip || "-"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      {user.email || "-"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {user.jabatan || "-"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor:
                            user.nama_role === "Admin" ? "#dbeafe" : "#dcfce7",
                          color:
                            user.nama_role === "Admin" ? "#075985" : "#166534",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor:
                              user.nama_role === "Admin"
                                ? "#075985"
                                : "#166534",
                            display: "inline-block",
                          }}
                        />
                        {user.nama_role || "-"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}
                    >
                      {user.nama_eselon1
                        ? `${user.nama_eselon1} / ${user.nama_eselon2 || "-"}`
                        : "-"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        fontSize: "13px",
                      }}
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
                          backgroundColor:
                            user.status_aktif === 1 ? "#dcfce7" : "#fee2e2",
                          color:
                            user.status_aktif === 1 ? "#166534" : "#991b1b",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor:
                              user.status_aktif === 1 ? "#166534" : "#991b1b",
                            display: "inline-block",
                          }}
                        />
                        {user.status_aktif === 1 ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        fontSize: "13px",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(user)}
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
        </div>
      )}

      {/* Modal Tambah Pengguna */}
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
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "32px",
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
                  background: isEditMode
                    ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isEditMode
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
                  {isEditMode ? (
                    <>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </>
                  ) : (
                    <>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </>
                  )}
                </svg>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#1e293b",
                  letterSpacing: "-0.025em",
                }}
              >
                {isEditMode ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
              </h2>
            </div>

            {submitSuccess && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  color: "#166534",
                  marginBottom: "16px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ✓ Pengguna berhasil {isEditMode ? "diupdate" : "ditambahkan"}!
              </div>
            )}

            {submitError && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  color: "#991b1b",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Baris 1: Email dan Role */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Role <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">-- Pilih Role --</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.nama_role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baris 2: Eselon dropdown (conditional) */}
              {(operatorType === "eselon1" || operatorType === "eselon2") && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Unit Eselon 1 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="eselon1_id"
                    value={formData.eselon1_id}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">-- Pilih Unit Eselon 1 --</option>
                    {eselon1List.map((e1) => (
                      <option key={e1.eselon1_id} value={e1.eselon1_id}>
                        {e1.nama_eselon1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {operatorType === "eselon2" && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Unit Eselon 2 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="eselon2_id"
                    value={formData.eselon2_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.eselon1_id}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      backgroundColor: !formData.eselon1_id
                        ? "#f1f5f9"
                        : "#ffffff",
                      cursor: !formData.eselon1_id ? "not-allowed" : "pointer",
                    }}
                  >
                    <option value="">
                      {!formData.eselon1_id
                        ? "-- Pilih Eselon 1 terlebih dahulu --"
                        : "-- Pilih Unit Eselon 2 --"}
                    </option>
                    {eselon2List
                      .filter(
                        (e2) =>
                          !formData.eselon1_id ||
                          e2.eselon1_id === parseInt(formData.eselon1_id)
                      )
                      .map((e2) => (
                        <option key={e2.eselon2_id} value={e2.eselon2_id}>
                          {e2.nama_eselon2}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Baris 3: Password Sementara dan Nama Lengkap */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Password{" "}
                    {isEditMode
                      ? "(Kosongkan jika tidak ingin diubah)"
                      : "Sementara"}{" "}
                    {!isEditMode && <span style={{ color: "#ef4444" }}>*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder={
                      isEditMode
                        ? "Kosongkan jika tidak diubah"
                        : "Masukkan password"
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="Nama lengkap"
                  />
                </div>
              </div>

              {/* Baris 4: NIP dan Jabatan */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    NIP
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="Nomor induk pegawai"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Jabatan
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    placeholder="Posisi jabatan"
                  />
                </div>
              </div>

              {/* Baris 5: Status (hanya tampil di mode edit) */}
              {isEditMode && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "14px",
                    }}
                  >
                    Status Pengguna <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="status_aktif"
                    value={formData.status_aktif}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value={1}>Aktif</option>
                    <option value={0}>Nonaktif</option>
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "28px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f1f5f9",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    opacity: submitting ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    !submitting &&
                    ((e.target.style.backgroundColor = "#e2e8f0"),
                    (e.target.style.color = "#475569"))
                  }
                  onMouseLeave={(e) => (
                    (e.target.style.backgroundColor = "#f1f5f9"),
                    (e.target.style.color = "#64748b")
                  )}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "12px 24px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    opacity: submitting ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                  }}
                  onMouseEnter={(e) =>
                    !submitting &&
                    ((e.target.style.transform = "translateY(-1px)"),
                    (e.target.style.boxShadow =
                      "0 4px 8px rgba(79, 70, 229, 0.3)"))
                  }
                  onMouseLeave={(e) => (
                    (e.target.style.transform = "translateY(0)"),
                    (e.target.style.boxShadow =
                      "0 2px 4px rgba(79, 70, 229, 0.2)")
                  )}
                >
                  {submitting
                    ? "Menyimpan..."
                    : isEditMode
                    ? "Update"
                    : "Simpan"}
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
