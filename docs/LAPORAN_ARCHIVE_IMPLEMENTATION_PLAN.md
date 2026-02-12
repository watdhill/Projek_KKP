# 📦 Rencana Implementasi: Sistem Arsip Laporan Tahunan

## 🎯 Tujuan
Menyimpan snapshot format laporan + data aplikasi per tahun untuk:
- Historical tracking
- Compliance audit
- Perbandingan year-over-year
- Recovery dari perubahan struktur

---

## 🏗️ Arsitektur 3-Layer Archive System

### **Layer 1: Format Archive** ✅
Menyimpan struktur format laporan (field apa saja, urutan, hierarchy)

```sql
CREATE TABLE format_laporan_archive (
    archive_id INT AUTO_INCREMENT PRIMARY KEY,
    tahun_archive INT NOT NULL,
    format_laporan_id INT NOT NULL,
    nama_format VARCHAR(255),
    field_ids JSON,
    status_at_archive VARCHAR(50) COMMENT 'aktif/non-aktif saat di-archive',
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    archived_by INT,
    notes TEXT COMMENT 'Catatan optional saat archive',
    UNIQUE KEY unique_archive (format_laporan_id, tahun_archive),
    INDEX idx_tahun (tahun_archive)
);

CREATE TABLE format_laporan_detail_archive (
    archive_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    archive_id INT NOT NULL,
    field_id INT NOT NULL,
    field_name VARCHAR(255),
    kode_field VARCHAR(100),   -- Untuk mapping ke data_aplikasi
    level INT,                  -- Hierarchy level (1, 2, 3)
    parent_id INT,              -- Parent field untuk nested structure
    order_index INT,            -- Urutan tampilan
    is_mandatory BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (archive_id) REFERENCES format_laporan_archive(archive_id) ON DELETE CASCADE,
    INDEX idx_archive (archive_id),
    INDEX idx_order (order_index)
);
```

**Benefit:**
- Bisa re-generate laporan dengan format lama
- Tracking perubahan struktur laporan
- Recovery jika format berubah

---

### **Layer 2: Data Archive** ⚠️ (MISSING - HARUS DITAMBAH)
Menyimpan snapshot DATA aplikasi per tahun

```sql
CREATE TABLE data_aplikasi_archive (
    id INT AUTO_INCREMENT PRIMARY KEY,
    archive_year INT NOT NULL,
    original_id INT NOT NULL COMMENT 'Reference to data_aplikasi.id',
    
    -- APPLICATION DATA SNAPSHOT (ALL FIELDS)
    nama_aplikasi VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    eselon1_id INT,
    eselon2_id INT,
    upt_id INT,
    environment_id INT,
    domain_aplikasi VARCHAR(255),
    cara_akses JSON COMMENT 'Array of access methods',
    
    -- CONTACT INFO
    pic_internal VARCHAR(255),
    pic_eksternal VARCHAR(255),
    kontak_pic_internal JSON COMMENT '{"phone": "", "email": ""}',
    kontak_pic_eksternal JSON COMMENT '{"phone": "", "email": ""}',
    
    -- TECHNICAL DETAILS
    penyedia_hosting VARCHAR(255),
    keamanan_aplikasi VARCHAR(50),
    sertifikat_ssl VARCHAR(50),
    ssl_expired_date DATE,
    waf_lainnya VARCHAR(255),
    
    -- CREDENTIALS (encrypted)
    username VARCHAR(255),
    password TEXT COMMENT 'Encrypted password',
    
    -- DATABASE & HOSTING
    database_aplikasi VARCHAR(100),
    pdn_backup VARCHAR(50),
    
    -- INTEGRATION
    pihak_ketiga VARCHAR(255),
    integrasi_lain VARCHAR(255),
    
    -- DOCUMENTATION
    penjelasan_aplikasi TEXT,
    keterangan TEXT,
    
    -- METADATA
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_by INT COMMENT 'User ID who archived',
    archive_trigger VARCHAR(50) COMMENT 'manual/auto/scheduled',
    
    INDEX idx_archive_year (archive_year),
    INDEX idx_original_id (original_id),
    INDEX idx_nama_aplikasi (nama_aplikasi),
    INDEX idx_status (status),
    INDEX idx_eselon2 (eselon2_id),
    INDEX idx_upt (upt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Yearly snapshot of application data for historical tracking';
```

**Benefit:**
- Data aplikasi tahun lalu tetap tersedia meski data live berubah/dihapus
- Compliance requirement (data retention)
- Year-over-year comparison

**⚠️ KENAPA PERLU?**
Tanpa ini, jika data aplikasi di-update/delete di tahun 2025, maka laporan tahun 2024 akan berisi data tahun 2025 (SALAH!)

---

### **Layer 3: Report Snapshots** ⚠️ (MISSING - HARUS DITAMBAH)
Menyimpan file Excel/PDF yang sudah di-generate

```sql
CREATE TABLE laporan_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- SNAPSHOT METADATA
    snapshot_name VARCHAR(255) NOT NULL,
    snapshot_year INT NOT NULL,
    file_type ENUM('excel', 'pdf') NOT NULL,
    file_path VARCHAR(500) NOT NULL COMMENT 'Relative path: laporan-snapshots/xxx.xlsx',
    file_size INT COMMENT 'File size in bytes',
    
    -- REFERENCES
    archive_id INT COMMENT 'Link to format_laporan_archive if used specific format',
    
    -- FILTER CONFIGURATION (PENTING!)
    filters JSON COMMENT '{"eselon2": 1, "upt": 5, "status": "aktif", "environment": 2}',
    
    -- STATISTICS
    total_records INT COMMENT 'Number of applications in this snapshot',
    
    -- USER TRACKING
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- METADATA
    description TEXT COMMENT 'Optional user description',
    is_official BOOLEAN DEFAULT FALSE COMMENT 'Official yearly report vs ad-hoc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_snapshot_year (snapshot_year),
    INDEX idx_file_type (file_type),
    INDEX idx_generated_by (generated_by),
    INDEX idx_generated_at (generated_at),
    INDEX idx_is_official (is_official),
    
    UNIQUE KEY unique_snapshot_name (snapshot_name),
    FOREIGN KEY (archive_id) REFERENCES format_laporan_archive(archive_id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES master_operator(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Track generated Excel/PDF report files';
```

**Benefit:**
- File laporan sudah jadi bisa di-download langsung (tidak perlu re-generate)
- Tracking siapa generate, kapan, dengan filter apa
- Bisa mark laporan official vs ad-hoc

---

## 🎨 UI/UX Design

### **A. Menu Structure**

```
📊 Laporan (existing)
  ├─ 📄 Export Laporan (existing - rename)
  │   ├─ Filter & Preview
  │   ├─ Export Excel
  │   └─ Export PDF
  │
  └─ 📦 Arsip Laporan Tahunan (NEW)
      ├─ Dashboard Arsip
      ├─ Generate Snapshot
      └─ Kelola Archive
```

### **B. Tab Navigation (Recommended)**

**Halaman: Laporan**
```
┌─────────────────────────────────────────────────────────┐
│ [📄 Export Laporan] [📦 Arsip Tahunan]                 │ <- Tabs
├─────────────────────────────────────────────────────────┤
│                                                          │
│  (Tab 1 Active: Export Laporan)                         │
│  - Filter existing                                       │
│  - Preview existing                                      │
│  - Export Excel/PDF existing                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ [📄 Export Laporan] [📦 Arsip Tahunan]                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  (Tab 2 Active: Arsip Tahunan)                          │
│                                                          │
│  🎯 ACTIONS                                             │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ 📦 Archive Data  │  │ 📊 Generate     │              │
│  │ Create snapshot  │  │ Create Report   │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                          │
│  📋 SNAPSHOT LIST                                       │
│  Filter: [Tahun ▾] [Type ▾] [Search...]                │
│                                                          │
│  │ NAME            │ YEAR │ TYPE  │ SIZE │ GENERATED  │ │
│  │ Laporan_Q4_2024 │ 2024 │ Excel │ 2MB  │ 2024-12-31 │ │
│  │ Annual_2024     │ 2024 │ PDF   │ 5MB  │ 2024-12-31 │ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Phases (REVISED)

### **Phase 1: Database & Core Backend (Week 1-2)**

**Tasks:**
- [ ] Create migration script untuk 3 tabel:
  - `format_laporan_archive`
  - `format_laporan_detail_archive`
  - `data_aplikasi_archive`
  - `laporan_snapshots`
  
- [ ] Backend Controller: `laporanArchiveController.js`
  ```javascript
  // Archive Operations
  POST   /api/laporan/archive/format/:year    // Archive format by year
  POST   /api/laporan/archive/data/:year      // Archive data by year
  GET    /api/laporan/archive/list            // List all archives
  GET    /api/laporan/archive/:year/formats   // Get format archives for year
  GET    /api/laporan/archive/:year/data      // Get data archives for year
  DELETE /api/laporan/archive/:archive_id     // Delete archive
  ```

- [ ] Backend Controller: `laporanSnapshotController.js`
  ```javascript
  // Snapshot Operations
  GET    /api/laporan/snapshots               // List snapshots
  POST   /api/laporan/snapshots/generate      // Generate new snapshot
  GET    /api/laporan/snapshots/:id/download  // Download snapshot file
  DELETE /api/laporan/snapshots/:id           // Delete snapshot
  GET    /api/laporan/snapshots/years         // Get available years
  ```

**Deliverables:**
- ✅ Database tables created
- ✅ API endpoints working
- ✅ Postman testing passed

---

### **Phase 2: Archive Management UI (Week 3)**

**Tasks:**
- [ ] Component: `ArsipLaporanTab.jsx`
  - Dashboard showing archive status
  - Action buttons (Archive Format, Archive Data)
  - Archive list table with filters
  
- [ ] Modal: `CreateArchiveModal.jsx`
  - Select year
  - Select what to archive (Format/Data/Both)
  - Confirmation
  - Progress indicator

- [ ] Modify `LaporanSection.jsx`
  - Add tab navigation
  - Integrate ArsipLaporanTab

**Deliverables:**
- ✅ Tab navigation working
- ✅ Archive creation UI
- ✅ Archive list view

---

### **Phase 3: Snapshot Generation UI (Week 4)**

**Tasks:**
- [ ] Component: `GenerateSnapshotModal.jsx`
  - Select year (from archived years)
  - Select format (from archived formats)
  - Apply filters (eselon, status, etc)
  - Input snapshot name & description
  - Preview before generate
  - Generate Excel/PDF
  
- [ ] Component: `SnapshotListTable.jsx`
  - List all generated snapshots
  - Filter by year, type
  - Download button
  - Delete button
  - View metadata

**Deliverables:**
- ✅ Snapshot generation working
- ✅ File storage working
- ✅ Download functionality

---

### **Phase 4: Advanced Features (Week 5-6)**

**Tasks:**
- [ ] **Comparison View**
  - Compare format changes across years
  - Compare data changes across years
  
- [ ] **Validation & Warnings**
  - Warn if format changed but not archived
  - Warn if data not archived for year
  - Prevent duplicate archives
  
- [ ] **Bulk Operations**
  - Bulk delete old snapshots
  - Bulk download multiple snapshots
  
- [ ] **Audit Trail**
  - Log all archive operations to audit_logs
  - Track who deleted what
  
- [ ] **Storage Management**
  - Monitor storage usage
  - Clean old files
  - Archive compression

**Deliverables:**
- ✅ Comparison features
- ✅ Validation working
- ✅ Audit trail complete

---

### **Phase 5: Automation & Optimization (Week 7)**

**Tasks:**
- [ ] **Auto-Archive Scheduler**
  - Cron job: Archive format every Dec 31
  - Cron job: Archive data every Dec 31
  - Email notification to admin
  
- [ ] **Access Control**
  - Only Super Admin can create archive
  - Operator Eselon 1 can view archives
  - Operator Eselon 2 can generate snapshots for their unit
  
- [ ] **Performance Optimization**
  - Add indexes
  - Query optimization
  - Lazy loading for large lists

**Deliverables:**
- ✅ Automated archiving
- ✅ Role-based access
- ✅ Optimized performance

---

## 🔄 Workflow Example

### **Scenario: End of Year 2024**

**Step 1: Archive Format (Admin)**
```
Tanggal: 2024-12-31
User: Super Admin
Action: Archive semua format laporan aktif

Klik "Archive Format Tahun 2024"
→ System snapshot 5 format aktif
→ System snapshot total 150 fields detail
→ Saved to: format_laporan_archive (5 records)
→ Saved to: format_laporan_detail_archive (150 records)
```

**Step 2: Archive Data (Auto/Manual)**
```
Tanggal: 2024-12-31 23:59
Trigger: Auto-scheduler / Manual button
Action: Archive semua data aplikasi tahun 2024

System copy 250 aplikasi from data_aplikasi
→ Saved to: data_aplikasi_archive (250 records untuk tahun 2024)
→ Notification sent to admin
```

**Step 3: Generate Official Report (Admin - Kapan Saja)**
```
Tanggal: 2025-01-15
User: Super Admin
Action: Generate laporan resmi tahunan 2024

Navigate to: Laporan → Arsip Tahunan
Klik "Generate Snapshot"

Form:
- Nama: "Laporan Resmi Tahunan 2024"
- Tahun: 2024
- Format: "Format Lengkap 2024" (dari archive)
- Filter: Semua eselon, semua status
- Type: Excel + PDF
- Official: Yes

Klik "Generate"
→ System generate Excel dari data_aplikasi_archive year=2024
→ System generate PDF dari data_aplikasi_archive year=2024
→ Files saved: /storage/laporan-snapshots/
→ Metadata saved: laporan_snapshots table
```

**Step 4: Download Report (Any Time)**
```
Tanggal: 2025-06-01
User: Operator Eselon 1
Action: Download laporan 2024 untuk audit

Navigate to: Laporan → Arsip Tahunan
Filter: Tahun = 2024, Official = Yes
Klik "Download" on "Laporan Resmi Tahunan 2024"

→ Download Excel/PDF langsung (tidak perlu re-generate)
```

---

## 📊 Database Relationships

```
format_laporan_archive (archive_id, tahun_archive)
    ↓ [1:N]
format_laporan_detail_archive (archive_id, field_id, field_name)

data_aplikasi_archive (id, archive_year, original_id)

laporan_snapshots (id, archive_id, file_path)
    ↓ [N:1] (optional)
format_laporan_archive (archive_id)
```

---

## ⚠️ Important Notes

### **1. Perbedaan Archive vs Snapshot:**
- **Archive** = Snapshot struktur + data (database records)
- **Snapshot** = File hasil export (Excel/PDF)

### **2. Kenapa Butuh 3 Layer?**
- **Format Archive**: Struktur laporan bisa berubah setiap tahun
- **Data Archive**: Data aplikasi bisa diupdate/delete
- **Report Snapshots**: File Excel/PDF sudah jadi untuk fast access

### **3. Storage Estimation:**
| Layer | Items/Year | Size/Item | Total/Year |
|-------|------------|-----------|------------|
| Format Archive | ~5 formats | 10 KB | 50 KB |
| Data Archive | ~250 apps | 5 KB | 1.25 MB |
| Snapshots | ~20 files | 2 MB | 40 MB |
| **TOTAL** | | | **~41 MB/year** |

10 years = ~410 MB (very manageable)

### **4. Cleanup Policy:**
- Keep archives: Forever (small size)
- Keep snapshots: 5 years (or configurable)
- Auto-compress files older than 2 years

---

## ✅ Checklist Implementasi

### **Database**
- [ ] format_laporan_archive table
- [ ] format_laporan_detail_archive table
- [ ] data_aplikasi_archive table
- [ ] laporan_snapshots table
- [ ] Migration script tested

### **Backend**
- [ ] laporanArchiveController.js
- [ ] laporanSnapshotController.js
- [ ] Routes configured
- [ ] File storage setup (/storage/laporan-snapshots/)
- [ ] API tested with Postman

### **Frontend**
- [ ] Tab navigation in LaporanSection.jsx
- [ ] ArsipLaporanTab.jsx component
- [ ] CreateArchiveModal.jsx
- [ ] GenerateSnapshotModal.jsx
- [ ] SnapshotListTable.jsx
- [ ] Download functionality

### **Testing**
- [ ] Archive format workflow
- [ ] Archive data workflow
- [ ] Generate snapshot workflow
- [ ] Download snapshot workflow
- [ ] Delete snapshot workflow
- [ ] Year-over-year comparison

### **Documentation**
- [ ] API documentation
- [ ] User manual
- [ ] Admin guide
- [ ] Database schema diagram

---

## 🎯 Success Criteria

1. ✅ Admin dapat archive format & data setiap akhir tahun
2. ✅ User dapat generate laporan dari data archive dengan format archive
3. ✅ File Excel/PDF tersimpan dan bisa di-download kapan saja
4. ✅ Tidak ada data loss saat data live berubah
5. ✅ Performance tetap baik dengan 10+ tahun archive
6. ✅ Storage usage manageable (<500 MB untuk 10 tahun)

---

**Dokumen ini adalah revisi dari rencana awal dengan penambahan Layer 2 (Data Archive) dan Layer 3 (Report Snapshots) yang crucial untuk sistem arsip yang complete.**
