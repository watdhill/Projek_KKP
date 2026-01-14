import { Outlet } from 'react-router-dom'

function OperatorEselon2Page() {
  const namaEselon2 = localStorage.getItem('namaEselon2') || 'Eselon 2'

  return (
    <section className="page-section">
      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Role: Operator {namaEselon2}</p>
        <h1 style={{ margin: '4px 0 12px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>
          Area Operator {namaEselon2}
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
          Akses khusus untuk dashboard, master data, dan data aplikasi di level {namaEselon2}.
        </p>
      </div>

      <Outlet />
    </section>
  );
}

export default OperatorEselon2Page
