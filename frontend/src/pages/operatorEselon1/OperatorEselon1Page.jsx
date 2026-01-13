import { Link, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { label: 'Dashboard', path: '/operator-eselon1' },
  { label: 'Master Data', path: '/operator-eselon1/master-data' },
  { label: 'Data Aplikasi', path: '/operator-eselon1/data-aplikasi' }
];

function OperatorEselon1Page() {
  const location = useLocation();
  const namaEselon1 = localStorage.getItem('namaEselon1') || 'Eselon 1'

  return (
    <section className="page-section">
      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Role: Operator {namaEselon1}</p>
        <h1 style={{ margin: '4px 0 12px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>
          Area Operator {namaEselon1}
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
          Akses khusus untuk dashboard, master data, dan data aplikasi di level {namaEselon1}.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: active ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                backgroundColor: active ? '#e0e7ff' : '#ffffff',
                color: active ? '#1d4ed8' : '#0f172a',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </section>
  );
}

export default OperatorEselon1Page
