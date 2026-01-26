import { useState, useEffect } from 'react';

function LaporanSection() {
  const [formatLaporan, setFormatLaporan] = useState([]);
  const [eselon1List, setEselon1List] = useState([]);
  const [eselon2List, setEselon2List] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [filters, setFilters] = useState({
    format_laporan_id: 'all',
    tahun: 'all',
    status: 'all',
    eselon1_id: 'all',
    eselon2_id: 'all'
  });

  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDropdownData();
    fetchPreviewData();
  }, []);

  useEffect(() => {
    if (filters.eselon1_id !== 'all') {
      fetchEselon2ByEselon1(filters.eselon1_id);
    } else {
      setEselon2List([]);
      setFilters(prev => ({ ...prev, eselon2_id: 'all' }));
    }
  }, [filters.eselon1_id]);

  const fetchDropdownData = async () => {
    try {
      const [formatRes, eselon1Res, statusRes] = await Promise.all([
        fetch('http://localhost:5000/api/laporan/format-laporan'),
        fetch('http://localhost:5000/api/master-data?type=eselon1'),
        fetch('http://localhost:5000/api/master-data?type=status_aplikasi')
      ]);

      if (formatRes.ok) {
        const formatData = await formatRes.json();
        setFormatLaporan(formatData.data || []);
      }

      if (eselon1Res.ok) {
        const eselon1Data = await eselon1Res.json();
        setEselon1List((eselon1Data.data || []).filter(e => e.status_aktif === 1));
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatusList(statusData.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchEselon2ByEselon1 = async (eselon1Id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/master-data?type=eselon2&eselon1_id=${eselon1Id}`);
      if (res.ok) {
        const data = await res.json();
        setEselon2List((data.data || []).filter(e => e.status_aktif === 1));
      }
    } catch (err) {
      console.error('Error fetching eselon2:', err);
    }
  };

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      const res = await fetch(`http://localhost:5000/api/laporan/preview?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal mengambil preview data');

      const data = await res.json();
      setPreviewData(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchPreviewData();
  };

  const handleExport = (format) => {
    const params = new URLSearchParams();

    // Determine if exporting all formats or single format
    const isExportAll = !filters.format_laporan_id || filters.format_laporan_id === 'all';

    // Only add format_laporan_id if a specific format is selected
    if (!isExportAll) {
      params.append('format_laporan_id', filters.format_laporan_id);
    }

    // Add other filters
    if (filters.tahun && filters.tahun !== 'all') params.append('tahun', filters.tahun);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.eselon1_id && filters.eselon1_id !== 'all') params.append('eselon1_id', filters.eselon1_id);
    if (filters.eselon2_id && filters.eselon2_id !== 'all') params.append('eselon2_id', filters.eselon2_id);

    // Use appropriate endpoint based on selection
    const endpoint = isExportAll ? `${format}-all` : format;
    const url = `http://localhost:5000/api/laporan/export/${endpoint}?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleExportAll = (format) => {
    const params = new URLSearchParams();

    // Add filters (no format_laporan_id for export all)
    if (filters.tahun && filters.tahun !== 'all') params.append('tahun', filters.tahun);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.eselon1_id && filters.eselon1_id !== 'all') params.append('eselon1_id', filters.eselon1_id);
    if (filters.eselon2_id && filters.eselon2_id !== 'all') params.append('eselon2_id', filters.eselon2_id);

    const url = `http://localhost:5000/api/laporan/export/${format}-all?${params.toString()}`;
    window.open(url, '_blank');
  };

  const currentYear = new Date().getFullYear();
  const years = ['all', currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  return (
    <section id="laporan" className="page-section" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Preview dan Laporan
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Filter dan export laporan aplikasi
        </p>
      </div>

      {/* Filter Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Format Laporan */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Format Laporan
            </label>
            <select
              value={filters.format_laporan_id}
              onChange={(e) => handleFilterChange('format_laporan_id', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Format</option>
              {formatLaporan.map(format => (
                <option key={format.format_laporan_id} value={format.format_laporan_id}>
                  {format.nama_format}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Tahun
            </label>
            <select
              value={filters.tahun}
              onChange={(e) => handleFilterChange('tahun', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'Semua Tahun' : year}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Status</option>
              {statusList.map(status => (
                <option key={status.status_aplikasi_id} value={status.status_aplikasi_id}>
                  {status.nama_status}
                </option>
              ))}
            </select>
          </div>

          {/* Eselon 1 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Eselon 1
            </label>
            <select
              value={filters.eselon1_id}
              onChange={(e) => handleFilterChange('eselon1_id', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Eselon 1</option>
              {eselon1List.map(eselon => (
                <option key={eselon.eselon1_id} value={eselon.eselon1_id}>
                  {eselon.nama_eselon1}
                </option>
              ))}
            </select>
          </div>

          {/* Eselon 2 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
              Eselon 2
            </label>
            <select
              value={filters.eselon2_id}
              onChange={(e) => handleFilterChange('eselon2_id', e.target.value)}
              disabled={filters.eselon1_id === 'all'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: filters.eselon1_id === 'all' ? '#f8fafc' : '#ffffff',
                cursor: filters.eselon1_id === 'all' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="all">Semua Eselon 2</option>
              {eselon2List.map(eselon => (
                <option key={eselon.eselon2_id} value={eselon.eselon2_id}>
                  {eselon.nama_eselon2}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleApplyFilters}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            Terapkan Filter
          </button>

          <button
            onClick={() => handleExport('excel')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            Export Excel
          </button>

          <button
            onClick={() => handleExport('pdf')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
          Preview Data
        </h2>

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

        {filters.format_laporan_id === 'all' ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              📊 Preview tidak tersedia untuk "Semua Format".<br />
              Silakan pilih format spesifik untuk melihat preview, atau langsung export untuk mendapatkan semua format dalam file Excel dengan multiple sheets.
            </p>
          </div>
        ) : loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px'
            }}>
              Memuat data...
            </div>
          </div>
        ) : previewData.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px dashed #cbd5e1'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Tidak ada data yang sesuai dengan filter</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9d5ff', borderBottom: '2px solid #d8b4fe' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>Nama Aplikasi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>Unit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>PIC</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>Status Aplikasi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>Tanggal Ditambahkan</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                    >
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>{item.nama_aplikasi}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.unit || item.nama_eselon1 || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.pic || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.status_aplikasi || 'Aktif'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.tanggal_ditambahkan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              color: '#64748b',
              fontSize: '13px'
            }}>
              <strong>Total:</strong> {previewData.length} aplikasi
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default LaporanSection;
