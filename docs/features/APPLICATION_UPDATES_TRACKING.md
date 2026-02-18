# Application Updates Tracking System

## Overview
Sistem tracking khusus untuk mencatat setiap perubahan (CREATE/UPDATE) pada aplikasi yang ditampilkan di dashboard. Berbeda dengan Audit Log yang mencatat semua aktivitas CRUD, fitur ini fokus pada perubahan aplikasi untuk ditampilkan di "Update Aplikasi Terbaru".

## Problem Yang Diselesaikan
**Before:**
- Dashboard "Update Aplikasi" hanya menampilkan data dari `data_aplikasi` berdasarkan `updated_at`
- Aplikasi yang sama hanya muncul 1x meski sudah diupdate berkali-kali
- Tidak ada history perubahan - hanya melihat state terakhir

**After:**
- Setiap CREATE dan UPDATE aplikasi dicatat sebagai entry terpisah
- Aplikasi yang diupdate 3x akan muncul 3x di dashboard
- Ada history lengkap dengan informasi action type (CREATE/UPDATE)
- Snapshot data penting disimpan (status, eselon, domain, dll)

## Database Schema

### Tabel: `application_updates`
```sql
CREATE TABLE application_updates (
    update_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_aplikasi VARCHAR(200) NOT NULL,
    action_type ENUM('CREATE', 'UPDATE') NOT NULL,
    
    -- Snapshot data saat update terjadi
    status_aplikasi_id BIGINT UNSIGNED,
    status_aplikasi_name VARCHAR(100),
    eselon1_id BIGINT UNSIGNED,
    eselon1_name VARCHAR(200),
    eselon2_id BIGINT UNSIGNED,
    eselon2_name VARCHAR(200),
    upt_id BIGINT UNSIGNED,
    upt_name VARCHAR(200),
    domain VARCHAR(200),
    
    -- Info perubahan (untuk UPDATE)
    changed_fields TEXT, -- Comma-separated list of changed fields
    
    -- Audit info
    updated_by VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_nama_aplikasi (nama_aplikasi),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_eselon1 (eselon1_id),
    INDEX idx_eselon2 (eselon2_id),
    INDEX idx_upt (upt_id)
)
```

## Backend Implementation

### 1. Migration Script
File: `backend/database/create_application_updates_table.js`

```bash
# Run migration
cd backend
node database/create_application_updates_table.js
```

**Features:**
- Creates table with proper schema
- Backfills existing applications as CREATE events
- Preserves created_at timestamps from original data

### 2. Controller Updates

#### aplikasiController.js
**New Function:**
```javascript
recordApplicationUpdate(params)
```

**Called after:**
- `createAplikasi` - Records with action_type='CREATE'
- `updateAplikasi` - Records with action_type='UPDATE' + changed_fields

**Workflow:**
1. Aplikasi di-create/update di `data_aplikasi`
2. Response dikirim ke client
3. Audit log dicatat (untuk compliance)
4. **Application update dicatat** (untuk dashboard display)

#### dashboardController.js
**Updated Functions:**
- `getRecentUpdates` - Admin dashboard
- `getOperatorRecentUpdates` - Operator dashboards

**Changes:**
- Query dari `application_updates` instead of `data_aplikasi`
- Returns `action_type`, `changed_fields`, dan snapshot data
- Filtered by eselon level untuk operator

## Frontend Display

### Dashboard Sections
**Files Updated:**
1. `frontend/src/pages/DashboardSection.jsx` (Admin)
2. `frontend/src/pages/operatorEselon1/OperatorEselon1Dashboard.jsx`
3. `frontend/src/pages/operatorEselon2/OperatorEselon2Dashboard.jsx`
4. `frontend/src/pages/operatorUPT/OperatorUPTDashboard.jsx`

### UI Features

**New Column: "AKSI"**
- Position: After "NAMA APLIKASI", before "DOMAIN"
- Displays action type badges:

**✨ BARU** (Green)
- Background: `linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)`
- Text color: `#166534`
- Border: `1.5px solid #16a34a40`
- Shows for `action_type='CREATE'`

**📝 UPDATE** (Blue)
- Background: `linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)`
- Text color: `#1e40af`
- Border: `1.5px solid #3b82f640`  
- Shows for `action_type='UPDATE'`

### Table Structure
```
┌──────────────┬────────┬────────┬────────┬───────────┬───────┐
│ NAMA APLIKASI│  AKSI  │ DOMAIN │ STATUS │UNIT ESELON│ WAKTU │
├──────────────┼────────┼────────┼────────┼───────────┼───────┤
│ App A        │✨ BARU │ app.id │ Aktif  │ BSKP      │ 2 min │
│ App B        │📝 UPDATE│ b.id   │ Aktif  │ DJPRL     │ 5 min │
│ App A        │📝 UPDATE│ app.id │ Nonaktif│ BSKP     │ 10m   │
└──────────────┴────────┴────────┴────────┴───────────┴───────┘
```

**Note:** App A muncul 2x karena di-create lalu di-update statusnya.

## Usage Examples

### Example 1: Aplikasi Baru Ditambahkan
```
Action: User menambahkan aplikasi "SIM Kepegawaian"
Result in application_updates:
- update_id: 1
- nama_aplikasi: "SIM Kepegawaian"
- action_type: "CREATE"
- status_aplikasi_name: "Aktif"
- eselon1_name: "BSKP"
- domain: "simpeg.id"
- created_at: 2026-02-11 10:30:00

Dashboard shows: "SIM Kepegawaian" dengan badge ✨ BARU
```

### Example 2: Status Aplikasi Diubah
```
Action: User mengubah status "SIM Kepegawaian" dari Aktif → Tidak Aktif
Result in application_updates:
- update_id: 2
- nama_aplikasi: "SIM Kepegawaian"
- action_type: "UPDATE"
- status_aplikasi_name: "Tidak Aktif"
- changed_fields: "status_aplikasi"
- created_at: 2026-02-11 14:20:00

Dashboard shows: 
- Entry lama (update_id: 1) tetap ada
- Entry baru (update_id: 2) muncul di atas dengan badge 📝 UPDATE
```

### Example 3: Multiple Updates
```
Timeline:
10:00 - CREATE "App Portal" → Entry 1 (✨ BARU)
11:00 - UPDATE domain → Entry 2 (📝 UPDATE)
12:00 - UPDATE status → Entry 3 (📝 UPDATE)
14:00 - UPDATE eselon → Entry 4 (📝 UPDATE)

Dashboard shows 4 separate entries, ordered by time (newest first)
```

## Comparison: application_updates vs audit_log

| Feature | application_updates | audit_log |
|---------|---------------------|-----------|
| Purpose | Dashboard display | Compliance & forensics |
| Scope | CREATE & UPDATE only | All CRUD operations |
| Data | Snapshot at change | Old values + New values |
| Retention | Permanent (dashboard history) | Permanent (compliance) |
| Performance | Optimized for display queries | Optimized for search/audit |
| Indexes | created_at, eselon filtering | user, table, action, timestamp |

## API Endpoints

### Admin Dashboard
```
GET /api/dashboard/recent-updates?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "update_id": 42,
      "nama_aplikasi": "App ABC",
      "action_type": "UPDATE",
      "domain": "abc.id",
      "status_aplikasi_name": "Aktif",
      "eselon1_name": "BSKP",
      "eselon2_name": null,
      "upt_name": null,
      "changed_fields": "status_aplikasi, domain",
      "created_at": "2026-02-11T10:30:00.000Z"
    },
    ...
  ]
}
```

### Operator Dashboard
```
GET /api/dashboard/operator/recent-updates?eselon1_id=1&limit=10

Response: Same structure, filtered by operator's access level
```

## Migration Steps

### 1. Create Table
```bash
cd backend
node database/create_application_updates_table.js
```

### 2. Restart Backend
```bash
# Backend akan otomatis menggunakan kode baru
npm start
```

### 3. Refresh Frontend
```bash
# Atau refresh browser jika frontend sudah running
```

### 4. Verify
1. Tambahkan aplikasi baru → Lihat badge ✨ BARU
2. Update aplikasi → Lihat badge 📝 UPDATE muncul sebagai entry baru
3. Cek database:
```sql
SELECT * FROM application_updates ORDER BY created_at DESC LIMIT 10;
```

## Recommendations & Future Improvements

### 1. **Cleanup/Archival Policy** ⭐⭐⭐
**Priority: HIGH**

**Problem:** Tabel akan terus membesar seiring waktu
**Solution:**
```sql
-- Arsip data >6 bulan ke tabel arsip
CREATE TABLE application_updates_archive LIKE application_updates;

-- Jalankan monthly
INSERT INTO application_updates_archive 
SELECT * FROM application_updates 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

DELETE FROM application_updates 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

**Implementation:**
- Buat cron job di backend untuk archival otomatis
- Atau buat manual cleanup script: `node database/archive_old_updates.js`

### 2. **Detail View/Modal** ⭐⭐
**Priority: MEDIUM**

**Feature:** Click pada row → Modal menampilkan detail lengkap
```jsx
<UpdateDetailModal>
  - Before/After comparison (untuk UPDATE)
  - List of changed fields dengan highlighting
  - Full snapshot data
  - User who made the change
  - Timestamp
  - IP address (for admin only)
</UpdateDetailModal>
```

### 3. **Filter & Search** ⭐⭐
**Priority: MEDIUM**

**Features:**
- Filter by action_type (CREATE/UPDATE)
- Filter by status_aplikasi
- Filter by eselon
- Search by nama_aplikasi
- Date range picker

**UI Mockup:**
```jsx
<Filters>
  [🔍 Search aplikasi...] [Aksi: All ▼] [Status: All ▼] [Tanggal: 7 hari ▼]
</Filters>
```

### 4. **Activity Timeline View** ⭐
**Priority: LOW (Nice to have)**

**Feature:** Timeline view untuk satu aplikasi
```
SIM Kepegawaian
├─ 📝 11 Feb 14:00 - Status changed to "Tidak Aktif"
├─ 📝 11 Feb 12:00 - Domain updated to "simpeg.kkp.go.id"
├─ 📝 10 Feb 16:00 - Eselon changed
└─ ✨ 10 Feb 10:00 - Application created

[Show More...]
```

**Implementation:**
```sql
SELECT * FROM application_updates 
WHERE nama_aplikasi = ? 
ORDER BY created_at DESC 
LIMIT 20;
```

### 5. **Dashboard Statistics** ⭐
**Priority: LOW**

**Metrics:**
- Total aplikasi baru hari ini/minggu ini
- Total updates hari ini/minggu ini  
- Most updated applications (top 5)
- Activity heatmap by hour

**UI:**
```jsx
<StatsRow>
  <Stat icon="✨" value="12" label="Aplikasi Baru (7 hari)" />
  <Stat icon="📝" value="48" label="Updates (7 hari)" />
  <Stat icon="🔥" value="App XYZ" label="Paling Sering Diupdate" />
</StatsRow>
```

### 6. **Real-time Updates** ⭐
**Priority: LOW**

**Feature:** Auto-refresh dashboard with WebSocket/SSE
```javascript
// Frontend
useEffect(() => {
  const eventSource = new EventSource('/api/dashboard/updates-stream');
  eventSource.onmessage = (event) => {
    const newUpdate = JSON.parse(event.data);
    setRecentUpdates(prev => [newUpdate, ...prev].slice(0, 10));
  };
}, []);
```

### 7. **Export Functionality** ⭐⭐
**Priority: MEDIUM**

**Feature:** Export update history to Excel/PDF
```jsx
<ExportButtons>
  <Button>📊 Export Excel</Button>
  <Button>📄 Export PDF</Button>
</ExportButtons>
```

**Use Cases:**
- Monthly reports
- Audit purposes
- Management presentations

### 8. **Comparison View** ⭐
**Priority: LOW**

**Feature:** Side-by-side sebelum/sesudah update
**Requires:** Store `old_values` in addition to snapshot

```sql
ALTER TABLE application_updates ADD COLUMN old_values JSON;
```

Then display:
```
┌────────────┬───────────────┬───────────────┐
│ Field      │ Before        │ After         │
├────────────┼───────────────┼───────────────┤
│ Status     │ Aktif         │ Tidak Aktif   │
│ Domain     │ old.id        │ new.id        │
└────────────┴───────────────┴───────────────┘
```

## Performance Considerations

### Indexes
Current indexes are optimized for:
- ✅ Time-based queries (created_at DESC)
- ✅ Application filtering (nama_aplikasi)
- ✅ Eselon-level filtering (eselon1_id, eselon2_id, upt_id)
- ✅ Action type filtering (action_type)

### Query Performance
- **LIMIT** is always used (default: 10)
- Indexed columns in WHERE clauses
- No complex JOINs needed (snapshot data stored)

### Scaling
**Current capacity:** Good for 10K+ updates/month
**If growth exceeds:**
1. Enable archival (recommendation #1)
2. Consider partitioning by month
3. Add Redis cache for hot data

## Maintenance

### Regular Tasks
1. **Monthly:** Check table size
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_name = 'application_updates';
```

2. **Quarterly:** Review and archive old data

3. **Yearly:** Analyze query performance and optimize indexes

### Monitoring
Log these metrics:
- Insert success rate to `application_updates`
- Query response time for dashboard
- Table growth rate

## Troubleshooting

### Issue: Updates not showing in dashboard
**Check:**
1. Tabel `application_updates` ada dan terisi
```sql
SELECT COUNT(*) FROM application_updates;
```
2. Backend controller success insert
```bash
# Check logs for errors
grep "Failed to record application update" backend.log
```

### Issue: Duplicate entries
**Root Cause:** `recordApplicationUpdate` dipanggil 2x
**Fix:** Ensure hanya dipanggil 1x di controller

### Issue: Missing fields
**Check:** Frontend expecting field yang tidak dikembalikan backend
**Fix:** Sync field names antara controller dan frontend mapping

## Summary
✅ Setiap CREATE/UPDATE aplikasi dicatat terpisah  
✅ Dashboard menampilkan history lengkap dengan badge visual  
✅ Data snapshot memudahkan tracking perubahan  
✅ Tidak bergantung pada audit_log (purpose berbeda)  
✅ Siap untuk enhancement (filter, detail view, export)  
