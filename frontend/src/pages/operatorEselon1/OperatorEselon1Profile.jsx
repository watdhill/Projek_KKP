import { useState, useEffect } from "react";

function OperatorEselon1Profile() {
  const [userData, setUserData] = useState({
    nama: "",
    nip: "",
    email: "",
    jabatan: "",
    nama_role: "",
    nama_eselon1: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
        setFormData(result.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "error", text: "Gagal memuat data profile" });
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setFormData(userData);
    setMessage({ type: "", text: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama,
            nip: formData.nip,
            email: formData.email,
            jabatan: formData.jabatan,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setUserData(result.data);
        setEditMode(false);
        setMessage({ type: "success", text: "Profile berhasil diupdate" });

        // Update localStorage jika ada
        localStorage.setItem("userName", result.data.nama);

        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Gagal mengupdate profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengupdate profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Password baru dan konfirmasi password tidak sama",
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setMessage({ type: "success", text: "Password berhasil diubah" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Gagal mengubah password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengubah password",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0" }}>
      {/* Header dengan Avatar */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: "12px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(102, 126, 234, 0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
              color: "#fff",
              boxShadow:
                "0 4px 12px rgba(245, 87, 108, 0.3), 0 0 0 2px rgba(255,255,255,0.15)",
              letterSpacing: "0.5px",
            }}
          >
            {getInitials(userData.nama)}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: "18px",
                fontWeight: "800",
                color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {userData.nama || "User"}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "14px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {userData.nama_role || "Admin"}
              </span>
              {userData.jabatan && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "18px",
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "#fff",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  {userData.jabatan}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "10px",
            background:
              message.type === "success"
                ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            border: `1.5px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
            color: message.type === "success" ? "#065f46" : "#991b1b",
            fontWeight: "600",
            fontSize: "13px",
            boxShadow: `0 3px 10px ${message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
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
            {message.type === "success" ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            ) : (
              <circle cx="12" cy="12" r="10" />
            )}
            {message.type === "success" ? (
              <polyline points="22 4 12 14.01 9 11.01" />
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1.5px solid #e2e8f0",
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Informasi Profile
            </h3>
          </div>
          {!editMode && (
            <button
              onClick={handleEditToggle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "11px",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(102, 126, 234, 0.2)";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {!editMode ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "5px",
                    background:
                      "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Nama Lengkap
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.nama || "-"}
              </p>
            </div>

            <div
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
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
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  NIP
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.nip || "Belum diisi"}
              </p>
            </div>

            <div
              style={{
                padding: "14px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "5px",
                    background:
                      "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Email
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.email || "-"}
              </p>
            </div>

            <div
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
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
                    strokeWidth="2.5"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Jabatan
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.jabatan || "Belum diisi"}
              </p>
            </div>

            <div
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
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
                    strokeWidth="2.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Role
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.nama_role || "-"}
              </p>
            </div>

            <div
              style={{
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
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
                    strokeWidth="2.5"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Direktorat Jenderal
                </label>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0f172a",
                  fontWeight: 600,
                }}
              >
                {userData.nama_eselon1 || "-"}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Nama Lengkap *
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
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  NIP *
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Jabatan *
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "18px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  background: loading
                    ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "10px",
                  boxShadow: loading
                    ? "none"
                    : "0 3px 10px rgba(16, 185, 129, 0.25)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 5px 16px rgba(16, 185, 129, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 3px 10px rgba(16, 185, 129, 0.25)";
                  }
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "10px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.background = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#fff";
                  }
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1.5px solid #e2e8f0",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(245, 158, 11, 0.25)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Keamanan Password
            </h3>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordData({
                  oldPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setMessage({ type: "", text: "" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.25)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(245, 158, 11, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(245, 158, 11, 0.25)";
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
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m6-7h6m-6 0H2" />
              </svg>
              Ganti Password
            </button>
          )}
        </div>

        {!showPasswordForm ? (
          <div
            style={{
              padding: "20px",
              background: "#f8fafc",
              border: "1.5px dashed #cbd5e1",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px" }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Klik tombol "Ganti Password" untuk mengubah password Anda
            </p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{ display: "grid", gap: "18px" }}>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Password Lama *
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f59e0b";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(245, 158, 11, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Password Baru *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f59e0b";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(245, 158, 11, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#64748b",
                    fontSize: "10px",
                    fontWeight: "500",
                  }}
                >
                  ⚠ Minimal 6 karakter
                </small>
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: "#fff",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f59e0b";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(245, 158, 11, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "12px 24px",
                  background: loading
                    ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 12px rgba(239, 68, 68, 0.25)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(239, 68, 68, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(239, 68, 68, 0.25)";
                  }
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
                  <path d="M12 1v6m0 6v6m6-7h6m-6 0H2" />
                </svg>
                {loading ? "Mengubah..." : "Ubah Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setMessage({ type: "", text: "" });
                }}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "12px 24px",
                  background: "#fff",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.background = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#fff";
                  }
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default OperatorEselon1Profile;
