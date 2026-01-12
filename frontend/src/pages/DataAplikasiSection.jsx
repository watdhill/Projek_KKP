import { useState, useEffect } from 'react';

function DataAplikasiSection() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/aplikasi');
        if (!response.ok) throw new Error('Gagal mengambil data aplikasi');
        const data = await response.json();
        setApps(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <section id="data-aplikasi" className="page-section">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Data Aplikasi
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Daftar aplikasi yang terintegrasi dalam sistem
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px'
          }}>
            Memuat data...
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data aplikasi</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Nama Aplikasi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Domain</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Eselon</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Cara Akses</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Bahasa Program</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Database</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app, index) => (
                <tr key={app.nama_aplikasi} style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                >
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{index + 1}</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{app.nama_aplikasi || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{app.domain || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                    {app.nama_eselon1 ? `${app.nama_eselon1}` : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3'
                    }}>
                      {app.nama_cara_akses || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{app.bahasa_pemrograman || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{app.basis_data || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f1f5f9',
        borderRadius: '6px',
        color: '#64748b',
        fontSize: '12px'
      }}>
        <strong>Total:</strong> {apps.length} aplikasi terdaftar
      </div>
    </section>
  );
}

export default DataAplikasiSection
