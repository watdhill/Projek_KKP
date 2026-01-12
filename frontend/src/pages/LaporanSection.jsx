import { useState, useEffect } from 'react';

function LaporanSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/laporan');
        if (!response.ok) throw new Error('Gagal mengambil data laporan');
        const data = await response.json();
        setReports(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'selesai': { bg: '#dcfce7', text: '#166534' },
      'proses': { bg: '#dbeafe', text: '#075985' },
      'draft': { bg: '#f1f5f9', text: '#475569' }
    };
    return colors[status] || { bg: '#f1f5f9', text: '#475569' };
  };

  return (
    <section id="laporan" className="page-section">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Laporan
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Kelola laporan dan dokumentasi sistem
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
      ) : reports.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data laporan</p>
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Judul</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Tipe</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Tanggal Buat</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => {
                const statusColor = getStatusColor(report.status);
                return (
                  <tr key={report.id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                  >
                    <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{report.judul}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{report.tipe}</td>
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
                        {report.status || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                      {new Date(report.tanggal_buat).toLocaleDateString('id-ID')}
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
        <strong>Total:</strong> {reports.length} laporan terdaftar
      </div>
    </section>
  );
}

export default LaporanSection
