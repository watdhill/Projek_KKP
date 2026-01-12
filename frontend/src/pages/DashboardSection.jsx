import { useState, useEffect } from 'react';

function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/statistics');
        if (!response.ok) throw new Error('Gagal mengambil data dashboard');
        const data = await response.json();
        setStats(data.data || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <p style={{
            margin: '0 0 8px 0',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 500
          }}>{title}</p>
          <p style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 700,
            color: color
          }}>{value || '0'}</p>
        </div>
        <div style={{
          fontSize: '32px'
        }}>{icon}</div>
      </div>
    </div>
  );

  return (
    <section id="dashboard" className="page-section">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Ringkasan statistik sistem dan status umum
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
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            ⟳ Memuat data dashboard...
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Pengguna"
            value={stats?.totalUsers || 0}
            icon="�"
            color="#3b82f6"
          />
          <StatCard
            title="Aplikasi Aktif"
            value={stats?.totalAplikasi || 0}
            icon="📱"
            color="#10b981"
          />
          <StatCard
            title="Total Laporan"
            value={stats?.totalLaporan || 0}
            icon="📊"
            color="#f59e0b"
          />
          <StatCard
            title="Total Eselon"
            value={stats?.totalEselon || 0}
            icon="🏢"
            color="#8b5cf6"
          />
        </div>
      )}

      <div style={{
        padding: '20px 24px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '6px',
        color: '#075985',
        fontSize: '13px'
      }}>
        <span style={{ fontWeight: 600 }}>ℹ️ Info:</span> Dashboard diperbarui secara real-time dari database
      </div>
    </section>
  );
}

export default DashboardSection
