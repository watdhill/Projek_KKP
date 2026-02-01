import { useState, useEffect } from 'react';

function OperatorUPTDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get upt_id from localStorage (set during login)
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const upt_id = userInfo.upt_id;

  useEffect(() => {
    if (upt_id) {
      fetchDashboardData();
    } else {
      setError('Informasi unit tidak ditemukan. Silakan login kembali.');
      setLoading(false);
    }
  }, [upt_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data
      const [statsRes, updatesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/dashboard/operator/statistics?upt_id=${upt_id}`),
        fetch(`http://localhost:5000/api/dashboard/operator/recent-updates?upt_id=${upt_id}&limit=10`)
      ]);

      if (!statsRes.ok || !updatesRes.ok) {
        throw new Error('Gagal mengambil data dashboard');
      }

      const statsData = await statsRes.json();
      const updatesData = await updatesRes.json();

      setStats(statsData.data || {});
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
          Dashboard Operator UPT
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Ringkasan statistik dan monitoring aplikasi unit {userInfo.nama_upt || 'Anda'}
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

          {/* Recent Updates / Application List */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
              Daftar Aplikasi UPT
            </h2>

            {recentUpdates.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Tidak ada aplikasi terdaftar</p>
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
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Unit Eselon 1</th>
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
                          <td style={{ padding: '12px 8px', color: '#64748b' }}>{update.singkatan_eselon1 || '-'}</td>
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

export default OperatorUPTDashboard;
