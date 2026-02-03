import { useState, useEffect } from 'react';

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

function OperatorEselon2Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Get eselon2_id and names from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const eselon2_id = localStorage.getItem('eselon2_id') || userInfo.eselon2_id;

  const nama_eselon2 = localStorage.getItem('namaEselon2') ||
    userInfo.nama_eselon2 ||
    userInfo.nama_unit ||
    '';

  const nama_eselon1 = localStorage.getItem('namaEselon1') ||
    userInfo.nama_eselon1 ||
    '';

  useEffect(() => {
    if (eselon2_id) {
      fetchDashboardData();
    } else {
      setError('Informasi unit tidak ditemukan. Silakan login kembali.');
      setLoading(false);
    }
  }, [eselon2_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsRes, chartRes, updatesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/dashboard/operator/statistics?eselon2_id=${eselon2_id}`),
        fetch(`http://localhost:5000/api/dashboard/operator/chart?eselon2_id=${eselon2_id}`),
        fetch(`http://localhost:5000/api/dashboard/operator/recent-updates?eselon2_id=${eselon2_id}&limit=10`)
      ]);

      if (!statsRes.ok || !chartRes.ok || !updatesRes.ok) {
        throw new Error('Gagal mengambil data dashboard');
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

  const StatCard = ({ title, value, icon, gradient }) => (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
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
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)";
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
      <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.01em" }}>
        {title}
      </p>
      <div style={{ position: "absolute", right: -20, bottom: -20, width: 100, height: 100, background: gradient, opacity: 0.05, borderRadius: "50%" }} />
    </div>
  );

  const getStatusColor = (statusName) => {
    const name = (statusName || '').toLowerCase();
    if (name.includes('aktif') && !name.includes('tidak') && !name.includes('non')) return { bg: '#d1fae5', text: '#065f46' };
    if (name.includes('tidak aktif') || name.includes('inactive') || name.includes('non aktif')) return { bg: '#fee2e2', text: '#991b1b' };
    if (name.includes('development') || name.includes('pengembangan') || name.includes('dibangun')) return { bg: '#e5e7eb', text: '#374151' };
    if (name.includes('maintenance')) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#e5e7eb', text: '#374151' };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <section className="page-section" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px",
          padding: "14px 18px", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#fff" }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 style={{
              margin: 0, marginBottom: "2px", fontSize: "18px", fontWeight: 700,
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em", lineHeight: 1.2, textTransform: "uppercase"
            }}>
              DASHBOARD OPERATOR ESELON 2
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 500, lineHeight: 1.4, marginTop: "4px" }}>
              Unit: <span style={{ fontWeight: 700, color: "#334155", fontSize: "15px" }}>{nama_eselon2 ? nama_eselon2.toUpperCase() : 'ESELON 2'}</span>
              <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
              <span style={{ color: "#64748b", fontSize: "13px" }}>{nama_eselon1 || 'Instansi Induk'}</span>
            </p>
          </div>
        </div>
        <button onClick={fetchDashboardData} disabled={loading} style={{
          padding: "8px 16px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
          cursor: loading ? "wait" : "pointer", fontSize: "12px", color: "#475569", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: "36px"
        }}
          onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = "#cbd5e1")}
          onMouseLeave={e => !loading && (e.currentTarget.style.borderColor = "#e2e8f0")}
        >
          {loading ? <span>Memuat...</span> : <span>↻ Refresh</span>}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "14px 18px", background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
          border: "1.5px solid #fecaca", borderRadius: "12px", color: "#991b1b", marginBottom: "24px",
          fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{
          padding: "80px 40px", textAlign: "center", color: "#64748b",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}>Memuat data dashboard...</span>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            <StatCard title="Aplikasi Aktif" value={stats?.aplikasiAktif || 0} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>} />
            <StatCard title="Aplikasi Tidak Aktif" value={stats?.aplikasiTidakAktif || 0} gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} />
            <StatCard title="Dalam Pengembangan" value={stats?.aplikasiDalamPengembangan || 0} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>} />
            <StatCard title="Total Aplikasi" value={stats?.totalAplikasi || 0} gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>} />
          </div>

          {/* Bar Chart - Distribution */}
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "12px",
            padding: "18px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
            border: "1px solid #e2e8f0", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                width: "36px", height: "36px", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>
                Distribusi Aplikasi Berdasarkan Status
              </h2>
            </div>
            {chartData.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Tidak ada data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chartData.map((item, index) => {
                  if (item.total === 0) return null;
                  return (
                    <div key={index} style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", borderRadius: "8px",
                      transition: "all 0.2s ease", cursor: "pointer", position: "relative"
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{ width: "220px", flexShrink: 0, fontSize: "11px", color: "#1e293b", fontWeight: 700, lineHeight: 1.3 }}>
                        {item.nama}
                      </div>
                      <div style={{ flex: 1, position: 'relative', height: '26px', background: '#f8fafc', borderRadius: '6px', overflow: 'hidden', border: "1.5px solid #e2e8f0" }}>
                        <div style={{
                          width: '100%', height: '100%',
                          backgroundColor: item.nama.toLowerCase().includes('aktif') && !item.nama.toLowerCase().includes('tidak')
                            ? '#10b981' : item.nama.toLowerCase().includes('tidak aktif')
                              ? '#ef4444' : '#9ca3af',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ minWidth: '40px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                        {item.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Updates */}
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "12px",
            padding: "18px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
            border: "1px solid #e2e8f0",
          }}>
            <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
              Update Aplikasi Terbaru
            </h2>
            {recentUpdates.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px' }}>Tidak ada update terbaru</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Nama Aplikasi</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Domain</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Terakhir Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUpdates.map((update, index) => {
                      const statusColors = getStatusColor(update.nama_status);
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px 8px', color: '#1e293b', fontWeight: 600 }}>{update.nama_aplikasi}</td>
                          <td style={{ padding: '12px 8px', color: '#64748b' }}>{update.domain || '-'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '12px', fontSize: '10px',
                              fontWeight: 600, backgroundColor: statusColors.bg, color: statusColors.text,
                              textTransform: "uppercase", letterSpacing: "0.02em"
                            }}>
                              {update.nama_status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#64748b' }}>
                            {formatDateTime(update.updated_at || update.created_at)}
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

export default OperatorEselon2Dashboard;
