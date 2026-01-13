import { useState, useEffect } from 'react';

// Konfigurasi Tabs
const TABS = [
  { key: 'pic_internal', label: 'PIC Internal' },
  { key: 'pic_eksternal', label: 'PIC Eksternal' },
];

const API_BASE = 'http://localhost:5000/api/master-data';

const ID_FIELDS = {
  pic_internal: 'pic_internal_id',
  pic_eksternal: 'pic_eksternal_id',
};

const TABLE_COLUMNS = {
  pic_internal: ['nama_pic_internal', 'kontak_pic_internal', 'status_aktif'],
  pic_eksternal: ['nama_pic_eksternal', 'keterangan', 'kontak_pic_eksternal', 'status_aktif'],
};

const FORM_FIELDS = {
  pic_internal: [
    { name: 'eselon2_id', label: 'Unit Eselon 2', type: 'select', options: [] }, // Options diisi dynamic
    { name: 'nama_pic_internal', label: 'Nama PIC Internal', type: 'text', placeholder: 'Nama PIC Internal' },
    { name: 'kontak_pic_internal', label: 'Kontak', type: 'text', placeholder: 'Email / No. HP' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
  pic_eksternal: [
    { name: 'nama_pic_eksternal', label: 'Nama PIC Eksternal', type: 'text', placeholder: 'Nama PIC Eksternal' },
    { name: 'keterangan', label: 'Keterangan', type: 'text', placeholder: 'Keterangan' },
    { name: 'kontak_pic_eksternal', label: 'Kontak', type: 'text', placeholder: 'Email / No. HP' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: [{ value: 1, label: 'Aktif' }, { value: 0, label: 'Nonaktif' }] },
  ],
};

function OperatorEselon2MasterData() {
  const [activeTab, setActiveTab] = useState('pic_internal');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [eselon2Options, setEselon2Options] = useState([]);

  // ---------- Helpers ----------
  const formatColumnHeader = (col) => col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const getStatusColor = (status) => {
    if (status === 1 || status === true || status === 'Aktif') {
      return { bg: '#dcfce7', text: '#166534', label: 'Aktif' };
    }
    return { bg: '#fee2e2', text: '#991b1b', label: 'Nonaktif' };
  };

  const getRowId = (item) => {
    const key = ID_FIELDS[activeTab];
    return item?.[key] ?? item?.id;
  };

  // ---------- Fetch ----------
  useEffect(() => {
    fetchData();
    fetchEselon2Options();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getUserEselon2Id = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.eselon2_id;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const eselon2Id = getUserEselon2Id();
      let url = `${API_BASE}?type=${activeTab}`;

      // Filter by eselon2_id for Operator Eselon 2
      if (eselon2Id) {
        url += `&eselon2_id=${eselon2Id}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal mengambil data');
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const fetchEselon2Options = async () => {
    try {
      const response = await fetch(`${API_BASE}?type=eselon2`);
      if (!response.ok) return;

      const result = await response.json();
      const opts = (result.data || [])
        .filter(item => item.status_aktif === 1)
        .map(item => ({ value: item.eselon2_id, label: item.nama_eselon2 }));

      setEselon2Options(opts);
    } catch (err) {
      console.error('Failed to fetch Eselon 2 options:', err);
    }
  };

  // ---------- Actions ----------
  const handleAdd = () => {
    setEditingItem(null);
    const initialData = {};
    const userEselon2Id = getUserEselon2Id();

    (FORM_FIELDS[activeTab] || []).forEach(field => {
      // Initialize Selects
      if (field.name === 'eselon2_id') {
        // Auto-assign from logged in user
        initialData[field.name] = userEselon2Id || '';
      } else if (field.type === 'select' && field.options?.length) {
        initialData[field.name] = field.options[0].value;
      } else {
        initialData[field.name] = '';
      }
    });

    // default status_aktif
    if (initialData.status_aktif === undefined) initialData.status_aktif = 1;

    setFormData(initialData);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const editData = {};
    FORM_FIELDS[activeTab]?.forEach(field => {
      editData[field.name] = item[field.name] ?? '';
    });

    // Ensure eselon2_id is preserved or re-assigned
    if (!editData.eselon2_id) {
      const userEselon2Id = getUserEselon2Id();
      editData.eselon2_id = userEselon2Id;
    }

    if (editData.status_aktif === undefined) editData.status_aktif = 1;
    setFormData(editData);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idField = ID_FIELDS[activeTab];
      const editId = editingItem?.[idField] ?? editingItem?.id;
      const url = editingItem
        ? `${API_BASE}/${editId}?type=${activeTab}`
        : `${API_BASE}?type=${activeTab}`;
      const method = editingItem ? 'PUT' : 'POST';

      const processedData = { ...formData };

      // Ensure eselon2_id is set
      const userEselon2Id = getUserEselon2Id();
      if (!processedData.eselon2_id && userEselon2Id) {
        processedData.eselon2_id = userEselon2Id;
      }

      // Normalize ints
      if (processedData.eselon2_id) processedData.eselon2_id = parseInt(processedData.eselon2_id, 10);
      if (processedData.status_aktif !== undefined) processedData.status_aktif = parseInt(processedData.status_aktif, 10);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data');

      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  // ---------- Derived ----------
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = TABLE_COLUMNS[activeTab] || [];

  return (
    <section className="page-section">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Master Data (PIC)
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Kelola data PIC Internal dan Eksternal
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
              transition: 'all 0.2s',
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
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              outline: 'none',
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
          }}
        >
          + Tambah Data
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '16px', borderRadius: '6px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
      ) : filteredData.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', color: '#64748b', borderRadius: '8px' }}>
          Belum ada data
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
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
                <tr key={getRowId(item) || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {columns.map(col => {
                    if (col === 'status_aktif') {
                      const st = getStatusColor(item[col]);
                      return (
                        <td key={col} style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: st.bg,
                            color: st.text,
                          }}>
                            {st.label}
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
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f59e0b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
                    >
                      Edit
                    </button>
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
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 600 }}>
              {editingItem ? 'Edit Data' : 'Tambah Data'}
            </h2>
            <form onSubmit={handleSubmit}>
              {(FORM_FIELDS[activeTab] || []).map(field => {
                // Skip rendering eselon2_id as it is auto-assigned
                if (field.name === 'eselon2_id') return null;

                let options = field.options || [];
                if (field.name === 'eselon2_id') options = eselon2Options;

                return (
                  <div key={field.name} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                      >
                        {options.length === 0 ? <option value="">-- Kosong --</option> :
                          options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default OperatorEselon2MasterData;
