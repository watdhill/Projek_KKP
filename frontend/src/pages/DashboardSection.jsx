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

function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, chartRes, updatesRes] = await Promise.all([
        fetch("http://localhost:5000/api/dashboard/statistics"),
        fetch("http://localhost:5000/api/dashboard/eselon1-chart"),
        fetch("http://localhost:5000/api/dashboard/recent-updates?limit=10"),
      ]);

      if (!statsRes.ok || !chartRes.ok || !updatesRes.ok) {
        throw new Error("Gagal mengambil data dashboard");
      }

      const statsData = await statsRes.json();
      const chartDataRes = await chartRes.json();
      const updatesData = await updatesRes.json();

      setStats(statsData.data || {});
      setChartData(chartDataRes.data || []);
      setRecentUpdates(updatesData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient, iconBg }) => (
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
      {/* Icon Container */}
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

      {/* Title */}
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

      {/* Decorative element */}
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

    // Aktif = Hijau (matching chart)
    if (
      name.includes("aktif") &&
      !name.includes("tidak") &&
      !name.includes("non")
    ) {
      return { bg: "#d1fae5", text: "#065f46" };
    }

    // Tidak Aktif / Inactive / Non Aktif = Merah (matching chart)
    if (
      name.includes("tidak aktif") ||
      name.includes("inactive") ||
      name.includes("non aktif")
    ) {
      return { bg: "#fee2e2", text: "#991b1b" };
    }

    // Dalam Pengembangan / Development / Sedang Dibangun = Abu-abu (matching chart)
    if (
      name.includes("development") ||
      name.includes("pengembangan") ||
      name.includes("dibangun")
    ) {
      return { bg: "#e5e7eb", text: "#374151" };
    }

    // Maintenance = Kuning
    if (name.includes("maintenance")) {
      return { bg: "#fef3c7", text: "#92400e" };
    }

    // Default = Abu-abu
    return { bg: "#e5e7eb", text: "#374151" };
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
      id="dashboard"
      className="page-section"
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
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
                fill="none"
              />
              <polyline
                points="9 22 9 12 15 12 15 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
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
              Ringkasan statistik dan monitoring aplikasi
            </p>
          </div>
        </div>
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
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
            />
            <span
              style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
            >
              Memuat data dashboard...
            </span>
          </div>
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

          {/* Bar Chart - Jumlah Aplikasi per unit */}
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
                Jumlah Aplikasi per Unit
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
                  {chartData.map((item, index) => (
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
                      {/* Tooltip muncul di atas seluruh baris */}
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
                          {item.nama_eselon1}
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
                          {item.nama_eselon1}
                        </div>
                        <span
                          style={{
                            display: "block",
                            color: "#64748b",
                            fontWeight: 500,
                            fontSize: "9px",
                            marginTop: "1px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {item.singkatan || ""}
                        </span>
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
                        {/* Stacked bars - full width */}
                        <div
                          style={{
                            display: "flex",
                            height: "100%",
                            width: "100%",
                            borderRadius: "6px",
                            overflow: "hidden",
                          }}
                        >
                          {item.aktif > 0 && (
                            <div
                              style={{
                                width: `${(item.aktif / item.total) * 100}%`,
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter =
                                  "brightness(1.15)";
                                e.currentTarget.style.boxShadow =
                                  "inset 0 -2px 8px rgba(0, 0, 0, 0.1)";
                                setHoveredBar({
                                  index,
                                  type: "aktif",
                                  value: item.aktif,
                                });
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = "brightness(1)";
                                e.currentTarget.style.boxShadow = "none";
                                setHoveredBar(null);
                              }}
                            />
                          )}
                          {item.tidak_aktif > 0 && (
                            <div
                              style={{
                                width: `${(item.tidak_aktif / item.total) * 100}%`,
                                background:
                                  "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter =
                                  "brightness(1.15)";
                                e.currentTarget.style.boxShadow =
                                  "inset 0 -2px 8px rgba(0, 0, 0, 0.1)";
                                setHoveredBar({
                                  index,
                                  type: "tidak_aktif",
                                  value: item.tidak_aktif,
                                });
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = "brightness(1)";
                                e.currentTarget.style.boxShadow = "none";
                                setHoveredBar(null);
                              }}
                            />
                          )}
                          {item.dalam_pengembangan > 0 && (
                            <div
                              style={{
                                width: `${(item.dalam_pengembangan / item.total) * 100}%`,
                                background:
                                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter =
                                  "brightness(1.15)";
                                e.currentTarget.style.boxShadow =
                                  "inset 0 -2px 8px rgba(0, 0, 0, 0.1)";
                                setHoveredBar({
                                  index,
                                  type: "dalam_pengembangan",
                                  value: item.dalam_pengembangan,
                                });
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = "brightness(1)";
                                e.currentTarget.style.boxShadow = "none";
                                setHoveredBar(null);
                              }}
                            />
                          )}
                        </div>

                        {/* Tooltip for bar segments */}
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
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background:
                                    hoveredBar.type === "aktif"
                                      ? "#10b981"
                                      : hoveredBar.type === "tidak_aktif"
                                        ? "#ef4444"
                                        : "#f59e0b",
                                }}
                              />
                              <span>
                                {hoveredBar.type === "aktif"
                                  ? "Aktif"
                                  : hoveredBar.type === "tidak_aktif"
                                    ? "Tidak Aktif"
                                    : "Dalam Pengembangan"}
                                :
                              </span>
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
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Updates Table */}
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
                <div>Belum ada update aplikasi</div>
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
                        UNIT ESELON
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
                      const statusColor = getStatusColor(update.nama_status);
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
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                borderRadius: "16px",
                                fontSize: "9px",
                                fontWeight: 700,
                                background: statusColor.bg,
                                color: statusColor.text,
                                border: `1.5px solid ${statusColor.text}20`,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                              }}
                            >
                              {update.nama_status || "Aktif"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#64748b",
                              fontSize: "10px",
                              fontWeight: 600,
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {update.singkatan_eselon1 ||
                              update.nama_eselon1 ||
                              "-"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#64748b",
                              fontSize: "10px",
                              fontWeight: 500,
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                              borderRight: "1px solid #e2e8f0",
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
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ opacity: 0.6 }}
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {formatDateTime(
                                update.updated_at || update.created_at,
                              )}
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

export default DashboardSection;
