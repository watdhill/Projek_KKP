import { useState, useEffect } from 'react';

function OperatorEselon1Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get eselon1_id from localStorage (set during login)
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const eselon1_id = userInfo.eselon1_id;

  useEffect(() => {
    if (eselon1_id) {
      fetchDashboardData();
    } else {
      setError('Informasi unit tidak ditemukan. Silakan login kembali.');
      setLoading(false);
    }
  }, [eselon1_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, chartRes, updatesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/dashboard/operator/statistics?eselon1_id=${eselon1_id}`),
        fetch(`http://localhost:5000/api/dashboard/operator/chart?eselon1_id=${eselon1_id}`),
        fetch(`http://localhost:5000/api/dashboard/operator/recent-updates?eselon1_id=${eselon1_id}&limit=10`)
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

  const StatCard = ({ title, value, bgColor, textColor }) => (
    <div style={{
      backgroundColor: bgColor,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{
        fontSize: '48px',
        fontWeight: '700',
        color: textColor,
        lineHeight: 1
      }}>{value || '0'}</div>
      <p style={{
        margin: 0,
        color: textColor,
        fontSize: '14px',
        fontWeight: 500,
        marginTop: '8px'
      }}>{title}</p>
    </div>
  );

  const getStatusColor = (statusName) => {
    const name = (statusName || '').toLowerCase();

    if (name.includes('aktif') && !name.includes('tidak') && !name.includes('non')) {
      return { bg: '#d1fae5', text: '#065f46' };
    }

    if (name.includes('tidak aktif') || name.includes('inactive') || name.includes('non aktif')) {
      return { bg: '#fee2e2', text: '#991b1b' };
    }

    if (name.includes('development') || name.includes('pengembangan') || name.includes('dibangun')) {
      return { bg: '#e5e7eb', text: '#374151' };
    }

    if (name.includes('maintenance')) {
      return { bg: '#fef3c7', text: '#92400e' };
    }

    return { bg: '#e5e7eb', text: '#374151' };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="page-section" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Dashboard Operator Eselon 1
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Ringkasan statistik dan monitoring aplikasi unit {userInfo.nama_eselon1 || 'Anda'}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            ⟳ Memuat data dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <StatCard
              title="Aplikasi Aktif"
              value={stats?.aplikasiAktif || 0}
              bgColor="#6366f1"
              textColor="#ffffff"
            />
            <StatCard
              title="Aplikasi Tidak Aktif"
              value={stats?.aplikasiTidakAktif || 0}
              bgColor="#06b6d4"
              textColor="#ffffff"
            />
            <StatCard
              title="Dalam Pengembangan"
              value={stats?.aplikasiDalamPengembangan || 0}
              bgColor="#84cc16"
              textColor="#ffffff"
            />
            <StatCard
              title="Total Aplikasi"
              value={stats?.totalAplikasi || 0}
              bgColor="#eab308"
              textColor="#ffffff"
            />
          </div>

          {/* Bar Chart - Jumlah Aplikasi per Eselon2 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '32px'
          }}>
            <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
              Jumlah Aplikasi per Unit Eselon 2
            </h2>

            {chartData.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Tidak ada data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chartData.map((item, index) => {
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        minWidth: '200px',
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: 500
                      }}>
                        {item.nama} ({item.singkatan || ''})
                      </div>

                      <div style={{ flex: 1, position: 'relative', height: '32px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        {/* Stacked bars */}
                        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                          {item.aktif > 0 && (
                            <div
                              style={{
                                width: `${(item.aktif / item.total) * 100}%`,
                                backgroundColor: 'rgb(16, 185, 129)',
                                transition: 'width 0.3s ease'
                              }}
                              title={`Aktif: ${item.aktif}`}
                            />
                          )}
                          {item.tidak_aktif > 0 && (
                            <div
                              style={{
                                width: `${(item.tidak_aktif / item.total) * 100}%`,
                                backgroundColor: 'rgb(239, 68, 68)',
                                transition: 'width 0.3s ease'
                              }}
                              title={`Tidak Aktif: ${item.tidak_aktif}`}
                            />
                          )}
                          {item.dalam_pengembangan > 0 && (
                            <div
                              style={{
                                width: `${(item.dalam_pengembangan / item.total) * 100}%`,
                                backgroundColor: 'rgb(156, 163, 175)',
                                transition: 'width 0.3s ease'
                              }}
                              title={`Dalam Pengembangan: ${item.dalam_pengembangan}`}
                            />
                          )}
                        </div>
                      </div>

                      <div style={{
                        minWidth: '50px',
                        textAlign: 'right',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1e293b'
                      }}>
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
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
              Update Aplikasi Terbaru
            </h2>

            {recentUpdates.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Tidak ada update terbaru</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Nama Aplikasi</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Domain</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Unit Eselon 2</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Terakhir Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUpdates.map((update, index) => {
                      const statusColors = getStatusColor(update.nama_status);
                      return (
                        <tr key={index} style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px 8px', color: '#1e293b', fontWeight: 500 }}>{update.nama_aplikasi}</td>
                          <td style={{ padding: '12px 8px', color: '#64748b' }}>{update.domain || '-'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: statusColors.bg,
                              color: statusColors.text
                            }}>
                              {update.nama_status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#64748b' }}>{update.nama_eselon2 || '-'}</td>
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

export default OperatorEselon1Dashboard;
