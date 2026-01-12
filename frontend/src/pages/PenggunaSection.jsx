import { useState, useEffect } from 'react';

function PenggunaSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) throw new Error('Gagal mengambil data pengguna');
        const data = await response.json();
        setUsers(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <section id="pengguna" className="page-section">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Kelola Pengguna
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Daftar pengguna sistem dan manajemen akses
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
      ) : users.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data pengguna</p>
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
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>No</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>Nama</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>NIP</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>Email</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>Jabatan</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>Role</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#475569'
                }}>Eselon</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.2s',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                >
                  <td style={{
                    padding: '12px 16px',
                    color: '#1e293b',
                    fontWeight: 500
                  }}>{index + 1}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#1e293b'
                  }}>{user.nama || '-'}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#64748b'
                  }}>{user.nip || '-'}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#64748b'
                  }}>{user.email || '-'}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#64748b'
                  }}>{user.jabatan || '-'}</td>
                  <td style={{
                    padding: '12px 16px'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: user.nama_role === 'Admin' ? '#dbeafe' : '#dcfce7',
                      color: user.nama_role === 'Admin' ? '#075985' : '#166534'
                    }}>
                      {user.nama_role || '-'}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#64748b',
                    fontSize: '13px'
                  }}>
                    {user.nama_eselon1 ? `${user.nama_eselon1} / ${user.nama_eselon2 || '-'}` : '-'}
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
        <strong>Total:</strong> {users.length} pengguna terdaftar
      </div>
    </section>
  )
}

export default PenggunaSection
