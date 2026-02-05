import { useState, useEffect } from "react";

// Add CSS for fade animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

function OperatorUPTDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Get upt_id from localStorage (support both direct item and userInfo object)
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const upt_id = localStorage.getItem("upt_id") || userInfo.upt_id;

  const nama_upt =
    localStorage.getItem("namaUPT") ||
    userInfo.nama_upt ||
    userInfo.nama_unit ||
    "";

  const nama_eselon1 =
    localStorage.getItem("namaEselon1") || userInfo.nama_eselon1 || "";

  useEffect(() => {
    if (upt_id) {
      fetchDashboardData();
    } else {
      setError("Informasi unit tidak ditemukan. Silakan login kembali.");
      setLoading(false);
    }
  }, [upt_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data (skip chart API, generate from stats instead)
      const [statsRes, updatesRes] = await Promise.all([
        fetch(
          `http://localhost:5000/api/dashboard/operator/statistics?upt_id=${upt_id}`,
        ),
        fetch(
          `http://localhost:5000/api/dashboard/operator/recent-updates?upt_id=${upt_id}&limit=10`,
        ),
      ]);

      if (!statsRes.ok || !updatesRes.ok) {
        throw new Error("Gagal mengambil data dashboard");
      }

      const statsData = await statsRes.json();
      const updatesData = await updatesRes.json();

      setStats(statsData.data || {});
      setRecentUpdates(updatesData.data || []);

      // Generate chart data from stats
      const generatedChartData = [];
      if (statsData.data) {
        if (statsData.data.aplikasiAktif > 0) {
          generatedChartData.push({
            nama: "Aktif",
            total: statsData.data.aplikasiAktif,
          });
        }
        if (statsData.data.aplikasiTidakAktif > 0) {
          generatedChartData.push({
            nama: "Tidak Aktif",
            total: statsData.data.aplikasiTidakAktif,
          });
        }
        if (statsData.data.aplikasiDalamPengembangan > 0) {
          generatedChartData.push({
            nama: "Dalam Pengembangan",
            total: statsData.data.aplikasiDalamPengembangan,
          });
        }
      }
      setChartData(generatedChartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "12px",
        padding: "18px",
        boxShadow:
          "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        minHeight: "110px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)";
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          background: gradient,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
          marginBottom: "6px",
        }}
      >
        {value || "0"}
      </div>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </p>
      <div
        style={{
          position: "absolute",
          right: -20,
          bottom: -20,
          width: 100,
          height: 100,
          background: gradient,
          opacity: 0.05,
          borderRadius: "50%",
        }}
      />
    </div>
  );

  const getStatusColor = (statusName) => {
    const name = (statusName || "").toLowerCase();

    if (
      name.includes("aktif") &&
      !name.includes("tidak") &&
      !name.includes("non")
    ) {
      return {
        bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        text: "#065f46",
        border: "#6ee7b7",
      };
    }

    if (
      name.includes("tidak aktif") ||
      name.includes("inactive") ||
      name.includes("non aktif")
    ) {
      return {
        bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        text: "#991b1b",
        border: "#fca5a5",
      };
    }

    if (
      name.includes("development") ||
      name.includes("pengembangan") ||
      name.includes("dibangun")
    ) {
      return {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        text: "#92400e",
        border: "#fcd34d",
      };
    }

    if (name.includes("maintenance")) {
      return {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        text: "#92400e",
        border: "#fcd34d",
      };
    }

    return { bg: "#e5e7eb", text: "#374151", border: "#cbd5e1" };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section
      className="page-section"
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          padding: "14px 18px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "12px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
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
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#fff" }}
            >
              <path
                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="9 22 9 12 15 12 15 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
              Dashboard
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
              Ringkasan statistik dan monitoring aplikasi -{" "}
              {nama_upt || "Loading..."}
            </p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            cursor: loading ? "wait" : "pointer",
            fontSize: "12px",
            color: "#475569",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            height: "36px",
          }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.borderColor = "#cbd5e1")
          }
          onMouseLeave={(e) =>
            !loading && (e.currentTarget.style.borderColor = "#e2e8f0")
          }
        >
          {loading ? <span>Memuat...</span> : <span>↻ Refresh</span>}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
            border: "1.5px solid #fecaca",
            borderRadius: "12px",
            color: "#991b1b",
            marginBottom: "24px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "80px 40px",
            textAlign: "center",
            color: "#64748b",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}>
            Memuat data dashboard...
          </span>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <StatCard
              title="Aplikasi Aktif"
              value={stats?.aplikasiAktif || 0}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <StatCard
              title="Aplikasi Tidak Aktif"
              value={stats?.aplikasiTidakAktif || 0}
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              }
            />
            <StatCard
              title="Dalam Pengembangan"
              value={stats?.aplikasiDalamPengembangan || 0}
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              }
            />
            <StatCard
              title="Total Aplikasi"
              value={stats?.totalAplikasi || 0}
              gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              }
            />
          </div>

          {/* Bar Chart - Distribution by Status */}
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "12px",
              padding: "18px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
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
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#1e293b",
                  letterSpacing: "-0.01em",
                }}
              >
                Distribusi Aplikasi Berdasarkan Status
              </h2>
            </div>

            {chartData.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 500,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: "8px",
                  border: "2px dashed #e2e8f0",
                }}
              >
                <svg
                  style={{ marginBottom: "12px", opacity: 0.5 }}
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
                <div>Tidak ada data</div>
              </div>
            ) : (
              <>
                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      background:
                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                      borderRadius: "16px",
                      border: "1px solid #6ee7b7",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#065f46",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderRadius: "50%",
                        boxShadow: "0 0 0 2px #d1fae5",
                      }}
                    ></div>
                    Aktif
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      background:
                        "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                      borderRadius: "16px",
                      border: "1px solid #fca5a5",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#991b1b",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        borderRadius: "50%",
                        boxShadow: "0 0 0 2px #fee2e2",
                      }}
                    ></div>
                    Tidak Aktif
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      background:
                        "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                      borderRadius: "16px",
                      border: "1px solid #fcd34d",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        borderRadius: "50%",
                        boxShadow: "0 0 0 2px #fef3c7",
                      }}
                    ></div>
                    Dalam Pengembangan
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {chartData.map((item, index) => {
                    if (item.total === 0) return null;
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0, 0, 0, 0.06)";
                          setHoveredIndex(index);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "none";
                          setHoveredIndex(null);
                        }}
                      >
                        {/* Tooltip nama status */}
                        {hoveredIndex === index && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-42px",
                              left: "10px",
                              right: "10px",
                              backgroundColor: "#1e293b",
                              color: "#fff",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              zIndex: 1000,
                              boxShadow:
                                "0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)",
                              pointerEvents: "none",
                              animation: "fadeInDown 0.2s ease",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.nama}
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-6px",
                                left: "20px",
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#1e293b",
                                transform: "rotate(45deg)",
                              }}
                            />
                          </div>
                        )}

                        <div
                          style={{
                            width: "220px",
                            flexShrink: 0,
                            fontSize: "11px",
                            color: "#1e293b",
                            fontWeight: 700,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.nama}
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            position: "relative",
                            height: "26px",
                            background: "#f8fafc",
                            borderRadius: "6px",
                            overflow: "visible",
                            border: "1.5px solid #e2e8f0",
                            boxShadow:
                              "0 1px 2px rgba(0, 0, 0, 0.04) inset, 0 0 0 1px rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          {/* Full bar */}
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                item.nama
                                  .toLowerCase()
                                  .includes("tidak aktif") ||
                                item.nama.toLowerCase().includes("non aktif") ||
                                item.nama.toLowerCase().includes("inactive")
                                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                  : item.nama
                                        .toLowerCase()
                                        .includes("pengembangan") ||
                                      item.nama
                                        .toLowerCase()
                                        .includes("development")
                                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                    : item.nama.toLowerCase().includes("aktif")
                                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                      : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                              borderRadius: "6px",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.filter = "brightness(1.15)";
                              e.currentTarget.style.boxShadow =
                                "inset 0 -2px 8px rgba(0, 0, 0, 0.1)";
                              setHoveredBar({ index, value: item.total });
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.filter = "brightness(1)";
                              e.currentTarget.style.boxShadow = "none";
                              setHoveredBar(null);
                            }}
                          />

                          {/* Tooltip for bar */}
                          {hoveredBar && hoveredBar.index === index && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-45px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor: "#1e293b",
                                color: "#fff",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                zIndex: 1000,
                                boxShadow:
                                  "0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)",
                                pointerEvents: "none",
                                animation: "fadeInDown 0.2s ease",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span>Jumlah:</span>
                                <span style={{ fontWeight: 800 }}>
                                  {hoveredBar.value}
                                </span>
                              </div>
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-6px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: "#1e293b",
                                  transform: "translateX(-50%) rotate(45deg)",
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            minWidth: "42px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#1e293b",
                            padding: "4px 8px",
                            background:
                              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            borderRadius: "6px",
                            border: "1.5px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                          }}
                        >
                          {item.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Recent Updates */}
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "12px",
              padding: "16px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                paddingBottom: "12px",
                borderBottom: "2px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1e293b",
                  letterSpacing: "-0.01em",
                }}
              >
                UPDATE APLIKASI TERBARU
              </h2>
            </div>

            {recentUpdates.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 500,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: "8px",
                  border: "2px dashed #e2e8f0",
                }}
              >
                <svg
                  style={{ marginBottom: "10px", opacity: 0.4 }}
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div>Belum ada aplikasi terdaftar</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 6px",
                    fontSize: "11px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: "transparent",
                          borderBottom: "none",
                        }}
                      >
                        NAMA APLIKASI
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: "transparent",
                          borderBottom: "none",
                        }}
                      >
                        DOMAIN
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: "transparent",
                          borderBottom: "none",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: "transparent",
                          borderBottom: "none",
                        }}
                      >
                        WAKTU
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUpdates.map((update, index) => {
                      const statusColors = getStatusColor(update.nama_status);
                      return (
                        <tr
                          key={index}
                          style={{
                            background:
                              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)";
                            e.currentTarget.style.transform = "translateX(4px)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 8px rgba(0, 0, 0, 0.06)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#1e293b",
                              fontWeight: 700,
                              fontSize: "11px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                              borderLeft: "1px solid #e2e8f0",
                            }}
                          >
                            {update.nama_aplikasi}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#64748b",
                              fontSize: "10px",
                              fontWeight: 500,
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {update.domain || "-"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                background: statusColors.bg,
                                color: statusColors.text,
                                borderRadius: "10px",
                                fontSize: "9px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                border: `1.5px solid ${statusColors.border || statusColors.bg}`,
                              }}
                            >
                              {update.nama_status}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#64748b",
                              fontSize: "10px",
                              fontWeight: 500,
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                              borderRight: "1px solid #e2e8f0",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <svg
                                style={{ flexShrink: 0, opacity: 0.5 }}
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span style={{ whiteSpace: "nowrap" }}>
                                {formatDateTime(
                                  update.updated_at || update.created_at,
                                )}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default OperatorUPTDashboard;
