import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/master-data';

// Tab configuration matching backend
const TABS = [
  { key: 'frekuensi_pemakaian', label: 'Frekuensi Pemakaian' },
  { key: 'format_laporan', label: 'Format Laporan' },
  { key: 'eselon1', label: 'Eselon 1' },
  { key: 'eselon2', label: 'Eselon 2' },
  { key: 'status_aplikasi', label: 'Status Aplikasi' },
  { key: 'environment', label: 'Environment' },
  { key: 'cara_akses', label: 'Cara Akses' },
  { key: 'pdn', label: 'PDN' },
];

// Form field configurations per type
const FORM_FIELDS = {
  eselon1: [
    { name: 'nama_eselon1', label: 'Eselon I', type: 'text', placeholder: 'Nama Eselon' },
    { name: 'singkatan', label: 'Singkatan', type: 'text', placeholder: 'Tulis Singkatan Eselon' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  eselon2: [
    { name: 'eselon1_id', label: 'Eselon 1', type: 'select', options: [] }, // Will be populated dynamically
    { name: 'nama_eselon2', label: 'Nama Eselon 2', type: 'text', placeholder: 'Nama Eselon 2' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  frekuensi_pemakaian: [
    { name: 'nama_frekuensi', label: 'Nama Frekuensi', type: 'text', placeholder: 'Nama Frekuensi' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  status_aplikasi: [
    { name: 'nama_status', label: 'Nama Status', type: 'text', placeholder: 'Nama Status Aplikasi' },
  ],
  environment: [
    { name: 'jenis_environment', label: 'Jenis Environment', type: 'text', placeholder: 'Jenis Environment' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  cara_akses: [
    { name: 'nama_cara_akses', label: 'Nama Cara Akses', type: 'text', placeholder: 'Nama Cara Akses' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  pdn: [
    { name: 'kode_pdn', label: 'Kode PDN', type: 'text', placeholder: 'Kode PDN' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  format_laporan: [
    { name: 'nama_aplikasi', label: 'Nama Aplikasi', type: 'text', placeholder: 'Nama Aplikasi' },
    { name: 'nama_format', label: 'Nama Format', type: 'text', placeholder: 'Nama Format Laporan' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
};

// Table column configurations per type
const TABLE_COLUMNS = {
  eselon1: ['nama_eselon1', 'singkatan', 'status_aktif'],
  eselon2: ['nama_eselon2', 'status_aktif'],
  frekuensi_pemakaian: ['nama_frekuensi', 'status_aktif'],
  status_aplikasi: ['nama_status'],
  environment: ['jenis_environment', 'status_aktif'],
  cara_akses: ['nama_cara_akses', 'status_aktif'],
  pdn: ['kode_pdn', 'status_aktif'],
  format_laporan: ['nama_aplikasi', 'nama_format', 'status_aktif'],
};

// ID field per type
const ID_FIELDS = {
  eselon1: 'eselon1_id',
  eselon2: 'eselon2_id',
  frekuensi_pemakaian: 'frekuensi_pemakaian',
  status_aplikasi: 'status_aplikasi_id',
  environment: 'environment_id',
  cara_akses: 'cara_akses_id',
  pdn: 'pdn_id',
  format_laporan: 'format_laporan_id',
};

function MasterDataSection() {
  const [activeTab, setActiveTab] = useState('eselon1');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [eselon1Options, setEselon1Options] = useState([]);

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
    if (activeTab === 'eselon2') {
      fetchEselon1Options();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}?type=${activeTab}`);
      if (!response.ok) throw new Error('Gagal mengambil data');
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEselon1Options = async () => {
    try {
      const response = await fetch(`${API_BASE}?type=eselon1`);
      if (response.ok) {
        const result = await response.json();
        // Only include active Eselon 1 (status_aktif = 1)
        setEselon1Options(
          result.data
            .filter(item => item.status_aktif === 1)
            .map(item => ({
              value: item.eselon1_id,
              label: item.nama_eselon1
            }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch Eselon 1 options:', err);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    const initialData = {};
    FORM_FIELDS[activeTab]?.forEach(field => {
      if (field.type === 'select' && field.options.length > 0) {
        initialData[field.name] = field.options[0].value;
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    FORM_FIELDS[activeTab]?.forEach(field => {
      editData[field.name] = item[field.name] ?? '';
    });
    setFormData(editData);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idField = ID_FIELDS[activeTab];
      const url = editingItem
        ? `${API_BASE}/${editingItem[idField]}?type=${activeTab}`
        : `${API_BASE}?type=${activeTab}`;
      const method = editingItem ? 'PUT' : 'POST';


      const processedData = { ...formData };
      if (processedData.eselon1_id !== undefined) {
        processedData.eselon1_id = parseInt(processedData.eselon1_id, 10);
      }
      if (processedData.status_aktif !== undefined) {
        processedData.status_aktif = parseInt(processedData.status_aktif, 10);
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data');

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (item, newStatus) => {
    try {
      const idField = ID_FIELDS[activeTab];
      const response = await fetch(`${API_BASE}/${item[idField]}/status?type=${activeTab}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_aktif: newStatus }),
      });
      if (!response.ok) throw new Error('Gagal mengubah status');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 1 || status === true || status === 'Aktif') {
      return { bg: '#dcfce7', text: '#166534', label: 'Aktif' };
    }
    return { bg: '#fee2e2', text: '#991b1b', label: 'Nonaktif' };
  };

  const formatColumnHeader = (col) => {
    return col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = TABLE_COLUMNS[activeTab] || [];

  return (
    <section id="master-data" className="page-section">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Master Data
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Data referensi yang jarang berubah
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === tab.key ? '2px solid #4f46e5' : '1px solid #e2e8f0',
              backgroundColor: activeTab === tab.key ? '#eef2ff' : '#ffffff',
              color: activeTab === tab.key ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Cari"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Tambah
        </button>
      </div>

      {/* Error Message */}
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

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
            Memuat data...
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {columns.map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>
                    {formatColumnHeader(col)}
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item[ID_FIELDS[activeTab]] || index}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  {columns.map(col => {
                    if (col === 'status_aktif') {
                      const statusColor = getStatusColor(item[col]);
                      return (
                        <td key={col} style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}>
                            {statusColor.label}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={col} style={{ padding: '12px 16px', color: '#1e293b' }}>
                        {item[col] || '-'}
                      </td>
                    );
                  })}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      {columns.includes('status_aktif') && (
                        <button
                          onClick={() => handleToggleStatus(item, item.status_aktif ? 0 : 1)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: item.status_aktif ? '#fef3c7' : '#dcfce7',
                            color: item.status_aktif ? '#92400e' : '#166534',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {item.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
              {editingItem ? 'Edit Data' : 'Tambah Data'}
            </h2>
            <form onSubmit={handleSubmit}>
              {FORM_FIELDS[activeTab]?.map(field => {
                // For eselon2, use dynamic options for eselon1_id
                let options = field.options;
                if (field.name === 'eselon1_id') {
                  options = eselon1Options;
                }

                return (
                  <div key={field.name} style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MasterDataSection;
