import { useState, useEffect } from 'react';

function DataAplikasiSection() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalAppName, setOriginalAppName] = useState('');
  const [master, setMaster] = useState({});
  const [formData, setFormData] = useState({
    nama_aplikasi: '',
    domain: '',
    deskripsi_fungsi: '',
    user_pengguna: '',
    data_digunakan: '',
    luaran_output: '',
    eselon1_id: '',
    eselon2_id: '',
    cara_akses_id: '',
    frekuensi_pemakaian: '',
    status_aplikasi: '',
    pdn_id: '',
    pdn_backup: '',
    environment_id: '',
    pic_internal: '',
    pic_eksternal: '',
    bahasa_pemrograman: '',
    basis_data: '',
    kerangka_pengembangan: '',
    unit_pengembang: '',
    unit_operasional_teknologi: '',
    nilai_pengembangan_aplikasi: '',
    pusat_komputasi_utama: '',
    pusat_komputasi_backup: '',
    mandiri_komputasi_backup: '',
    perangkat_lunak: '',
    cloud: '',
    ssl: '',
    alamat_ip_publik: '',
    keterangan: '',
    status_bmn: '',
    server_aplikasi: '',
    tipe_lisensi_bahasa: '',
    api_internal_status: '',
    waf: '',
    waf_lainnya: '',
    va_pt_status: '',
    va_pt_waktu: '',
    antivirus: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // fetch apps function (reusable)
  const fetchApps = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchApps();
    fetchMasterDropdowns();
  }, []);

  const filtered = apps.filter(a => {
    if (statusFilter !== 'all') {
      const status = (a.nama_status || '').toLowerCase();
      if (status !== statusFilter) return false;
    }
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.nama_aplikasi || '').toLowerCase().includes(s) || (a.nama_pic_internal || '').toLowerCase().includes(s) || (a.nama_eselon1 || '').toLowerCase().includes(s);
  });

  const getStatusBadge = (app) => {
    const status = (app.nama_status || 'Aktif').toLowerCase();
    if (status === 'aktif') return { label: 'Aktif', bg: '#dcfce7', color: '#166534' };
    if (status.includes('pengembang') || status.includes('pengembangan')) return { label: app.nama_status || 'Pengembangan', bg: '#fff7ed', color: '#b45309' };
    return { label: app.nama_status || 'Tidak Aktif', bg: '#fee2e2', color: '#991b1b' };
  };

  // Fetch master data for dropdowns
  const fetchMasterDropdowns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/master-data/dropdown');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        setMaster(result.data);
      }
    } catch (e) {
      console.error('Failed to fetch master dropdowns', e);
    }
  };

  // Open modal and load master data
  const openModal = () => {
    fetchMasterDropdowns();
    setEditMode(false);
    setOriginalAppName('');
    setFormData({
      nama_aplikasi: '', domain: '', deskripsi_fungsi: '', user_pengguna: '', data_digunakan: '', luaran_output: '', eselon1_id: '', eselon2_id: '', cara_akses_id: '', frekuensi_pemakaian: '', status_aplikasi: '', pdn_id: '', pdn_backup: '', environment_id: '', pic_internal: '', pic_eksternal: '', bahasa_pemrograman: '', basis_data: '', kerangka_pengembangan: '', unit_pengembang: '', unit_operasional_teknologi: '', nilai_pengembangan_aplikasi: '', pusat_komputasi_utama: '', pusat_komputasi_backup: '', mandiri_komputasi_backup: '', perangkat_lunak: '', cloud: '', ssl: '', alamat_ip_publik: '', keterangan: '', status_bmn: '', server_aplikasi: '', tipe_lisensi_bahasa: '', api_internal_status: '', waf: '', waf_lainnya: '', va_pt_status: '', va_pt_waktu: '', antivirus: ''
    });
    setShowModal(true);
  };

  // Open edit modal with pre-filled data
  const openEditModal = async (appName) => {
    try {
      fetchMasterDropdowns();
      const res = await fetch(`http://localhost:5000/api/aplikasi/${encodeURIComponent(appName)}`);
      if (!res.ok) throw new Error('Gagal mengambil detail aplikasi');
      const result = await res.json();
      const app = result.data;
      
      // Pre-fill form with existing data
      setFormData({
        nama_aplikasi: app.nama_aplikasi || '',
        domain: app.domain || '',
        deskripsi_fungsi: app.deskripsi_fungsi || '',
        user_pengguna: app.user_pengguna || '',
        data_digunakan: app.data_digunakan || '',
        luaran_output: app.luaran_output || '',
        eselon1_id: app.eselon1_id ? String(app.eselon1_id) : '',
        eselon2_id: app.eselon2_id ? String(app.eselon2_id) : '',
        cara_akses_id: app.cara_akses_id ? String(app.cara_akses_id) : '',
        frekuensi_pemakaian: app.frekuensi_pemakaian ? String(app.frekuensi_pemakaian) : '',
        status_aplikasi: app.status_aplikasi ? String(app.status_aplikasi) : '',
        pdn_id: app.pdn_id ? String(app.pdn_id) : '',
        pdn_backup: app.kode_pdn || '',
        environment_id: app.environment_id ? String(app.environment_id) : '',
        pic_internal: app.pic_internal || '',
        pic_eksternal: app.pic_eksternal || '',
        bahasa_pemrograman: app.bahasa_pemrograman || '',
        basis_data: app.basis_data || '',
        kerangka_pengembangan: app.kerangka_pengembangan || '',
        unit_pengembang: app.unit_pengembang || '',
        unit_operasional_teknologi: app.unit_operasional_teknologi || '',
        nilai_pengembangan_aplikasi: app.nilai_pengembangan_aplikasi || '',
        pusat_komputasi_utama: app.pusat_komputasi_utama || '',
        pusat_komputasi_backup: app.pusat_komputasi_backup || '',
        mandiri_komputasi_backup: app.mandiri_komputasi_backup || '',
        perangkat_lunak: app.perangkat_lunak || '',
        cloud: app.cloud || '',
        ssl: app.ssl || '',
        alamat_ip_publik: app.alamat_ip_publik || '',
        keterangan: app.keterangan || '',
        status_bmn: app.status_bmn || '',
        server_aplikasi: app.server_aplikasi || '',
        tipe_lisensi_bahasa: app.tipe_lisensi_bahasa || '',
        api_internal_status: app.api_internal_status || '',
        waf: app.waf || '',
        waf_lainnya: '',
        va_pt_status: app.va_pt_status || '',
        va_pt_waktu: app.va_pt_waktu || '',
        antivirus: app.antivirus || ''
      });
      
      setEditMode(true);
      setOriginalAppName(appName);
      setShowModal(true);
    } catch (err) {
      alert('Error: ' + (err.message || err));
    }
  };

  const handleFormChange = (k, v) => setFormData(prev => ({ ...prev, [k]: v }));

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nama_aplikasi || formData.nama_aplikasi.trim() === '') {
      alert('Nama Aplikasi wajib diisi');
      return;
    }

    try {
      // Require all fields to be filled
      const fieldLabels = {
        nama_aplikasi: 'Nama Aplikasi', domain: 'Domain', deskripsi_fungsi: 'Deskripsi/Fungsi', user_pengguna: 'User/Pengguna', data_digunakan: 'Data yang Digunakan', luaran_output: 'Luaran/Output', eselon1_id: 'Eselon 1', eselon2_id: 'Eselon 2', cara_akses_id: 'Cara Akses', frekuensi_pemakaian: 'Frekuensi Pemakaian', status_aplikasi: 'Status Aplikasi', pdn_id: 'PDN Utama', pdn_backup: 'PDN Backup', environment_id: 'Environment', pic_internal: 'PIC Internal', pic_eksternal: 'PIC Eksternal', bahasa_pemrograman: 'Bahasa Pemrograman', basis_data: 'Basis Data', kerangka_pengembangan: 'Kerangka Pengembangan', unit_pengembang: 'Unit Pengembang', unit_operasional_teknologi: 'Unit Operasional Teknologi', nilai_pengembangan_aplikasi: 'Nilai Pengembangan Aplikasi', pusat_komputasi_utama: 'Pusat Komputasi Utama', pusat_komputasi_backup: 'Pusat Komputasi Backup', mandiri_komputasi_backup: 'Mandiri Komputasi Backup', perangkat_lunak: 'Perangkat Lunak', cloud: 'Cloud', ssl: 'SSL', alamat_ip_publik: 'Alamat IP Publik', keterangan: 'Keterangan', status_bmn: 'Status BMN', server_aplikasi: 'Server Aplikasi', tipe_lisensi_bahasa: 'Tipe Lisensi Bahasa', api_internal_status: 'API Internal', waf: 'WAF', waf_lainnya: 'WAF - Lainnya', va_pt_status: 'VA/PT', va_pt_waktu: 'VA/PT - Waktu', antivirus: 'Antivirus'
      };

      const missing = [];
      for (const key of Object.keys(fieldLabels)) {
        const val = formData[key];
        // waf_lainnya only required when waf === 'lainnya'
        if (key === 'waf_lainnya') continue;
        // va_pt_waktu only required when va_pt_status === 'ya'
        if (key === 'va_pt_waktu') continue;
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
          missing.push(fieldLabels[key]);
        }
      }

      // Conditional checks
      if (formData.waf === 'lainnya') {
        if (!formData.waf_lainnya || formData.waf_lainnya.trim() === '') missing.push(fieldLabels['waf_lainnya']);
      }
      if (formData.va_pt_status === 'ya') {
        if (!formData.va_pt_waktu || formData.va_pt_waktu.trim() === '') missing.push(fieldLabels['va_pt_waktu']);
      }

      if (missing.length > 0) {
        alert('Field berikut wajib diisi:\n- ' + missing.join('\n- '));
        return;
      }

      // Additional client-side validation
      if (formData.alamat_ip_publik && formData.alamat_ip_publik.trim() !== '') {
        const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
        if (!ipRegex.test(formData.alamat_ip_publik.trim())) {
          alert('Alamat IP Publik tidak valid. Gunakan format IPv4 seperti 192.168.0.1');
          return;
        }
      }
      if (formData.nilai_pengembangan_aplikasi && formData.nilai_pengembangan_aplikasi.trim() !== '') {
        if (isNaN(Number(formData.nilai_pengembangan_aplikasi))) {
          alert('Nilai Pengembangan Aplikasi harus berupa angka');
          return;
        }
      }

      setSubmitting(true);

      const payload = {
        nama_aplikasi: formData.nama_aplikasi,
        domain: formData.domain || null,
        deskripsi_fungsi: formData.deskripsi_fungsi || null,
        user_pengguna: formData.user_pengguna || null,
        data_digunakan: formData.data_digunakan || null,
        luaran_output: formData.luaran_output || null,
        eselon1_id: formData.eselon1_id || null,
        eselon2_id: formData.eselon2_id || null,
        cara_akses_id: formData.cara_akses_id || null,
        frekuensi_pemakaian: formData.frekuensi_pemakaian || null,
        status_aplikasi: formData.status_aplikasi || null,
        pdn_id: formData.pdn_id || null,
        environment_id: formData.environment_id || null,
        pic_internal: formData.pic_internal || null,
        pic_eksternal: formData.pic_eksternal || null,
        bahasa_pemrograman: formData.bahasa_pemrograman || null,
        basis_data: formData.basis_data || null,
        kerangka_pengembangan: formData.kerangka_pengembangan || null,
        unit_pengembang: formData.unit_pengembang || null,
        unit_operasional_teknologi: formData.unit_operasional_teknologi || null,
        nilai_pengembangan_aplikasi: formData.nilai_pengembangan_aplikasi || null,
        pusat_komputasi_utama: formData.pusat_komputasi_utama || null,
        pusat_komputasi_backup: formData.pusat_komputasi_backup || null,
        mandiri_komputasi_backup: formData.mandiri_komputasi_backup || null,
        perangkat_lunak: formData.perangkat_lunak || null,
        cloud: formData.cloud || null,
        ssl: formData.ssl || null,
        alamat_ip_publik: formData.alamat_ip_publik || null,
        keterangan: formData.keterangan || null,
        status_bmn: formData.status_bmn || null,
        server_aplikasi: formData.server_aplikasi || null,
        tipe_lisensi_bahasa: formData.tipe_lisensi_bahasa || null,
        api_internal_status: formData.api_internal_status || null,
        waf: formData.waf === 'lainnya' ? formData.waf_lainnya : formData.waf || null,
        antivirus: formData.antivirus || null,
        va_pt_status: formData.va_pt_status || null,
        va_pt_waktu: formData.va_pt_status === 'ya' ? formData.va_pt_waktu : null
      };

      const url = editMode 
        ? `http://localhost:5000/api/aplikasi/${encodeURIComponent(originalAppName)}`
        : 'http://localhost:5000/api/aplikasi';
      const method = editMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan aplikasi');
      // refresh list
      await fetchApps();
      setShowModal(false);
      alert(editMode ? 'Aplikasi berhasil diupdate' : 'Aplikasi berhasil ditambahkan');
    } catch (err) {
      alert('Error: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="data-aplikasi" className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '6px', fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>Data Aplikasi</h1>
          <p style={{ margin: 0, color: '#475569' }}>Satu form untuk semua kebutuhan laporan; relasi ke master data.</p>
        </div>
        <div>
          <button
            onClick={openModal}
            style={{
              backgroundColor: '#0ea5e9',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            + Input Aplikasi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/PIC/Unit..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e6eef6' }} />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e6eef6' }}>
          <option value="all">Semua Status</option>
          {(master.status_aplikasi || []).map(s => (
            <option key={s.status_aplikasi_id} value={(s.nama_status || '').toLowerCase()}>{s.nama_status}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', marginBottom: '16px', fontSize: '14px' }}>⚠️ {error}</div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}><div style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>Memuat data...</div></div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e6eef6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e6eef6' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Aplikasi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Unit</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>PIC</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const badge = getStatusBadge(app);
                const unit = app.nama_eselon1 || app.nama_eselon2 || '-';
                const pic = app.nama_pic_internal || app.nama_pic_eksternal || '-';
                const isActive = (app.nama_status || 'Aktif').toLowerCase().includes('aktif');
                return (
                  <tr key={app.nama_aplikasi ?? i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fbfdff' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.nama_aplikasi || '-'}</div>
                      {app.domain && (<div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}><a href={app.domain.startsWith('http') ? app.domain : `https://${app.domain}`} target="_blank" rel="noreferrer">{app.domain}</a></div>)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{unit}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{pic}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color, fontWeight: 700, fontSize: '13px' }}>{badge.label}</span>
                    </td>
                    
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => openEditModal(app.nama_aplikasi)} title="Edit" style={{ padding: '6px 8px', background: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '12px', color: '#64748b', fontSize: '13px' }}><strong>Total:</strong> {filtered.length} aplikasi ditampilkan</div>

      {/* Modal skeleton for input/edit (UI only for now) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: '100%', maxWidth: '900px', background: '#fff', borderRadius: '12px', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>{editMode ? 'Edit Aplikasi' : 'Input Aplikasi'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmitForm}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nama Aplikasi</label>
                <input value={formData.nama_aplikasi} onChange={(e) => handleFormChange('nama_aplikasi', e.target.value)} placeholder="Contoh: Sistem Informasi Kepegawaian" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Deskripsi dan fungsi Aplikasi</label>
                <textarea value={formData.deskripsi_fungsi} onChange={(e) => handleFormChange('deskripsi_fungsi', e.target.value)} placeholder="Contoh: Aplikasi untuk mengelola data pegawai, absensi, dan penggajian" rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Eselon 1</label>
                  <select value={formData.eselon1_id} onChange={(e) => {
                    const val = e.target.value;
                    handleFormChange('eselon1_id', val);
                    handleFormChange('eselon2_id', ''); // Reset eselon2 when eselon1 changes
                  }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.eselon1 || []).map(x => (<option key={x.eselon1_id} value={x.eselon1_id}>{x.nama_eselon1}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Eselon 2</label>
                  <select value={formData.eselon2_id} onChange={(e) => handleFormChange('eselon2_id', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.eselon2 || [])
                      .filter(x => !formData.eselon1_id || String(x.eselon1_id) === String(formData.eselon1_id))
                      .map(x => (<option key={x.eselon2_id} value={x.eselon2_id}>{x.nama_eselon2}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Cara Akses</label>
                  <select value={formData.cara_akses_id} onChange={(e) => handleFormChange('cara_akses_id', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.cara_akses || []).map(x => (<option key={x.cara_akses_id} value={x.cara_akses_id}>{x.nama_cara_akses}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Frekuensi Pemakaian</label>
                  <select value={formData.frekuensi_pemakaian} onChange={(e) => handleFormChange('frekuensi_pemakaian', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.frekuensi_pemakaian || []).map(x => (<option key={x.frekuensi_pemakaian} value={x.frekuensi_pemakaian}>{x.nama_frekuensi}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Status Aplikasi</label>
                  <select value={formData.status_aplikasi} onChange={(e) => handleFormChange('status_aplikasi', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.status_aplikasi || []).map(x => (<option key={x.status_aplikasi_id} value={x.status_aplikasi_id}>{x.nama_status}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Environment</label>
                  <select value={formData.environment_id} onChange={(e) => handleFormChange('environment_id', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.environment || []).map(x => (<option key={x.environment_id} value={x.environment_id}>{x.jenis_environment}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>PDN Utama</label>
                  <select value={formData.pdn_id} onChange={(e) => {
                    const id = e.target.value;
                    handleFormChange('pdn_id', id);
                    const pdnObj = (master.pdn || []).find(p => String(p.pdn_id) === String(id));
                    handleFormChange('pdn_backup', pdnObj ? pdnObj.kode_pdn : '');
                  }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    {(master.pdn || []).map(x => (<option key={x.pdn_id} value={x.pdn_id}>{x.kode_pdn}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>PDN Backup</label>
                  <input value={formData.pdn_backup} readOnly placeholder="Auto-fill dari PDN Utama" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6', backgroundColor: '#f8fafc', cursor: 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>PIC Internal</label>
                  <input value={formData.pic_internal} onChange={(e) => handleFormChange('pic_internal', e.target.value)} placeholder="Contoh: Budi Santoso" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>PIC Eksternal</label>
                  <input value={formData.pic_eksternal} onChange={(e) => handleFormChange('pic_eksternal', e.target.value)} placeholder="Contoh: PT Telkom Indonesia" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Domain</label>
                <input value={formData.domain} onChange={(e) => handleFormChange('domain', e.target.value)} placeholder="https://contoh.domain" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>User / Pengguna</label>
                <textarea value={formData.user_pengguna} onChange={(e) => handleFormChange('user_pengguna', e.target.value)} placeholder="Contoh: Pegawai internal, masyarakat umum" rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Data Yang Digunakan</label>
                <textarea value={formData.data_digunakan} onChange={(e) => handleFormChange('data_digunakan', e.target.value)} placeholder="Contoh: Data pegawai, data absensi, data penggajian" rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Luaran/Output</label>
                <textarea value={formData.luaran_output} onChange={(e) => handleFormChange('luaran_output', e.target.value)} placeholder="Contoh: Laporan absensi bulanan, slip gaji, rekapitulasi kinerja" rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Bahasa Pemrograman</label>
                  <input value={formData.bahasa_pemrograman} onChange={(e) => handleFormChange('bahasa_pemrograman', e.target.value)} placeholder="Contoh: PHP, Python, Java" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Basis Data</label>
                  <input value={formData.basis_data} onChange={(e) => handleFormChange('basis_data', e.target.value)} placeholder="Contoh: MySQL, PostgreSQL, Oracle" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Kerangka Pengembangan / Framework</label>
                  <input value={formData.kerangka_pengembangan} onChange={(e) => handleFormChange('kerangka_pengembangan', e.target.value)} placeholder="Contoh: Laravel, Django, Spring Boot" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Unit Pengembang</label>
                  <input value={formData.unit_pengembang} onChange={(e) => handleFormChange('unit_pengembang', e.target.value)} placeholder="Contoh: Pusdatin, Tim IT Internal" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Unit Operasional Teknologi</label>
                  <input value={formData.unit_operasional_teknologi} onChange={(e) => handleFormChange('unit_operasional_teknologi', e.target.value)} placeholder="Contoh: Subbag TI, Divisi Infrastruktur" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nilai Pengembangan Aplikasi</label>
                  <input value={formData.nilai_pengembangan_aplikasi} onChange={(e) => handleFormChange('nilai_pengembangan_aplikasi', e.target.value)} placeholder="Contoh: 500000000 (dalam Rupiah)" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Pusat Komputasi Utama</label>
                  <input value={formData.pusat_komputasi_utama} onChange={(e) => handleFormChange('pusat_komputasi_utama', e.target.value)} placeholder="Contoh: Data Center Jakarta" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Pusat Komputasi Backup</label>
                  <input value={formData.pusat_komputasi_backup} onChange={(e) => handleFormChange('pusat_komputasi_backup', e.target.value)} placeholder="Contoh: Data Center Surabaya" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Mandiri Komputasi Backup</label>
                  <input value={formData.mandiri_komputasi_backup} onChange={(e) => handleFormChange('mandiri_komputasi_backup', e.target.value)} placeholder="Contoh: Server Lokal Kantor" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Perangkat Lunak</label>
                  <input value={formData.perangkat_lunak} onChange={(e) => handleFormChange('perangkat_lunak', e.target.value)} placeholder="Contoh: Windows Server, Linux Ubuntu" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Cloud</label>
                  <input value={formData.cloud} onChange={(e) => handleFormChange('cloud', e.target.value)} placeholder="Contoh: AWS, Google Cloud, Azure" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>SSL</label>
                  <input value={formData.ssl} onChange={(e) => handleFormChange('ssl', e.target.value)} placeholder="Contoh: Let's Encrypt, Comodo SSL" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Antivirus</label>
                  <input value={formData.antivirus} onChange={(e) => handleFormChange('antivirus', e.target.value)} placeholder="Contoh: Kaspersky, Norton, Avast" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Alamat IP Publik</label>
                  <input value={formData.alamat_ip_publik} onChange={(e) => handleFormChange('alamat_ip_publik', e.target.value)} placeholder="Contoh: 192.168.1.100" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Keterangan</label>
                  <input value={formData.keterangan} onChange={(e) => handleFormChange('keterangan', e.target.value)} placeholder="Contoh: Aplikasi masih dalam tahap pengembangan" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Status BMN</label>
                  <select value={formData.status_bmn} onChange={(e) => handleFormChange('status_bmn', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    <option value="ya">Ya</option>
                    <option value="tidak">Tidak</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Server Aplikasi</label>
                  <select value={formData.server_aplikasi} onChange={(e) => handleFormChange('server_aplikasi', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    <option value="Virtual Machine">Virtual Machine</option>
                    <option value="Baremetal">Baremetal</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Tipe Lisensi Bahasa Pemrograman</label>
                  <select value={formData.tipe_lisensi_bahasa} onChange={(e) => handleFormChange('tipe_lisensi_bahasa', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Lisensi">Lisensi</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>API Internal Sistem Integrasi</label>
                  <select value={formData.api_internal_status} onChange={(e) => handleFormChange('api_internal_status', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                    <option value="">-Pilih-</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="tidak">Tidak</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>WAF</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={formData.waf} onChange={(e) => handleFormChange('waf', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                      <option value="">-Pilih-</option>
                      <option value="ya">Ya</option>
                      <option value="tidak">Tidak</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                    {formData.waf === 'lainnya' && (
                      <input value={formData.waf_lainnya} onChange={(e) => handleFormChange('waf_lainnya', e.target.value)} placeholder="Sebutkan" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>VA/PT</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={formData.va_pt_status} onChange={(e) => handleFormChange('va_pt_status', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }}>
                      <option value="">-Pilih-</option>
                      <option value="ya">Ya</option>
                      <option value="tidak">Tidak</option>
                    </select>
                    {formData.va_pt_status === 'ya' && (
                      <input value={formData.va_pt_waktu} onChange={(e) => handleFormChange('va_pt_waktu', e.target.value)} placeholder="Waktu VA/PT" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e6eef6' }} />
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e6eef6', background: '#fff' }}>Batal</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default DataAplikasiSection;
