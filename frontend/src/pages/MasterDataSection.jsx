import { useState, useEffect } from 'react';

function MasterDataSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/master-data');
        if (!response.ok) throw new Error('Gagal mengambil data master');
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'aktif': { bg: '#dcfce7', text: '#166534' },
      'nonaktif': { bg: '#fee2e2', text: '#991b1b' },
      'pending': { bg: '#fef3c7', text: '#92400e' }
    };
    return colors[status] || { bg: '#f1f5f9', text: '#475569' };
  };

  return (
    <section id="master-data" className="page-section">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Master Data
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Kelola data referensi dan kategori sistem
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
      ) : data.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data master</p>
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Kategori</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Nama</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Deskripsi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const statusColor = getStatusColor(item.status);
                return (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                  >
                    <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{item.kategori}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{item.nama}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.deskripsi}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: statusColor.bg,
                        color: statusColor.text
                      }}>
                        {item.status || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
        <strong>Total:</strong> {data.length} data master terdaftar
      </div>
    </section>
  );
}

export default MasterDataSection
