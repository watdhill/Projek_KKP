import { useState, useEffect } from 'react';

function PenggunaSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [eselon1List, setEselon1List] = useState([]);
  const [eselon2List, setEselon2List] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    jabatan: '',
    password: '',
    role_id: '',
    eselon1_id: '',
    eselon2_id: ''
  });
  const [operatorType, setOperatorType] = useState('eselon1'); // Track operator selection
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
    fetchMasterData();
  }, []);

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

  // Fetch master data (roles, eselon)
  const fetchMasterData = async () => {
    try {
      const [rolesRes, eselon1Res, eselon2Res] = await Promise.all([
        fetch('http://localhost:5000/api/master/roles'),
        fetch('http://localhost:5000/api/master/eselon1'),
        fetch('http://localhost:5000/api/master/eselon2')
      ]);

      if (rolesRes.ok) setRoles((await rolesRes.json()).data || []);
      if (eselon1Res.ok) setEselon1List((await eselon1Res.json()).data || []);
      if (eselon2Res.ok) setEselon2List((await eselon2Res.json()).data || []);
    } catch (err) {
      console.log('Info: Master data tidak tersedia');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role_id: parseInt(formData.role_id),
          eselon1_id: formData.eselon1_id ? parseInt(formData.eselon1_id) : null,
          eselon2_id: formData.eselon2_id ? parseInt(formData.eselon2_id) : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambah pengguna');
      }

      setSubmitSuccess(true);
      setFormData({ nama: '', nip: '', email: '', jabatan: '', password: '', role_id: '', eselon1_id: '', eselon2_id: '' });
      setOperatorType('eselon1');
      
      setTimeout(() => {
        setShowModal(false);
        fetchUsers();
      }, 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pengguna" className="page-section">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
            Kelola Pengguna
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Daftar pengguna sistem dan manajemen akses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          + Tambah Pengguna
        </button>
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

      {/* Modal Tambah Pengguna */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: '#1e293b', textAlign: 'center' }}>
              Tambah Akun Baru
            </h2>

            {submitSuccess && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                color: '#166534',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                ✓ Pengguna berhasil ditambahkan!
              </div>
            )}

            {submitError && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#991b1b',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Baris 1: Email dan Eselon 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Eselon 1
                  </label>
                  <select
                    name="eselon1_id"
                    value={formData.eselon1_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">-- Pilih Unit --</option>
                    {eselon1List.length > 0 ? (
                      eselon1List.map(e1 => (
                        <option key={e1.eselon1_id} value={e1.eselon1_id}>
                          {e1.nama_eselon1}
                        </option>
                      ))
                    ) : null}
                  </select>
                </div>
              </div>

              {/* Baris 2: Operator (Radio) dan Eselon 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Operator
                  </label>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      <input
                        type="radio"
                        name="operatorType"
                        value="eselon1"
                        checked={operatorType === 'eselon1'}
                        onChange={() => {
                          setOperatorType('eselon1');
                          setFormData(prev => ({ ...prev, eselon2_id: '' }));
                        }}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      Eselon 1
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      <input
                        type="radio"
                        name="operatorType"
                        value="eselon2"
                        checked={operatorType === 'eselon2'}
                        onChange={() => setOperatorType('eselon2')}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      Eselon 2
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Eselon 2
                  </label>
                  <select
                    name="eselon2_id"
                    value={formData.eselon2_id}
                    onChange={handleInputChange}
                    disabled={operatorType === 'eselon1'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      backgroundColor: operatorType === 'eselon1' ? '#f1f5f9' : '#ffffff',
                      color: operatorType === 'eselon1' ? '#94a3b8' : '#1e293b',
                      cursor: operatorType === 'eselon1' ? 'not-allowed' : 'pointer',
                      opacity: operatorType === 'eselon1' ? 0.6 : 1
                    }}
                  >
                    <option value="">-- Pilih Unit --</option>
                    {eselon2List.length > 0 ? (
                      eselon2List.map(e2 => (
                        <option key={e2.eselon2_id} value={e2.eselon2_id}>
                          {e2.nama_eselon2}
                        </option>
                      ))
                    ) : null}
                  </select>
                </div>
              </div>

              {/* Baris 3: Password Sementara dan Nama Lengkap */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Password Sementara <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Masukkan password"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Nama Lengkap <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Nama lengkap"
                  />
                </div>
              </div>

              {/* Baris 4: NIP dan Jabatan */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    NIP
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Nomor induk pegawai"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                    Jabatan
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Posisi jabatan"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ nama: '', nip: '', email: '', jabatan: '', password: '', role_id: '', eselon1_id: '', eselon2_id: '' });
                    setOperatorType('eselon1');
                    setSubmitError(null);
                    setSubmitSuccess(false);
                  }}
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity: submitting ? 0.6 : 1,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#c7d2fe')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#e0e7ff')}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: submitting ? 0.7 : 1,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#1e40af')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#1e3a8a')}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default PenggunaSection
