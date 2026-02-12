# Audit Log System

Sistem audit log untuk mencatat semua aktivitas pengguna dalam aplikasi.

## Fitur

- ✅ Pencatatan otomatis aktivitas CREATE, UPDATE, DELETE
- ✅ Pencatatan login/logout pengguna
- ✅ Filter berdasarkan tabel, aksi, user, dan tanggal
- ✅ Pagination
- ✅ Detail view dengan old/new values
- ✅ Export ke CSV dan Excel
- ✅ IP address dan user agent tracking

## Setup Database

Jalankan script SQL untuk membuat tabel audit_log:

```bash
mysql -u your_user -p your_database < backend/database/create_audit_log_table.sql
```

Atau jalankan query langsung di MySQL:

```sql
source backend/database/create_audit_log_table.sql;
```

## Struktur Tabel

```sql
CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(100),
  action VARCHAR(50),
  record_id INT,
  old_values JSON,
  new_values JSON,
  changes JSON,
  detail TEXT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Penggunaan di Backend

### 1. Manual Logging

```javascript
const { logAudit, getIpAddress, getUserAgent } = require('../utils/auditLogger');

// Di dalam controller
await logAudit({
  userId: req.user.id,
  tableName: 'users',
  action: 'CREATE',
  recordId: newUser.id,
  newValues: newUser,
  detail: 'User baru berhasil dibuat',
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req)
});
```

### 2. Menggunakan Middleware

```javascript
const { auditMiddleware } = require('../utils/auditLogger');

router.post('/users', 
  authenticate,
  auditMiddleware({ tableName: 'users', action: 'CREATE' }),
  userController.createUser
);
```

### 3. Log dengan Perubahan Detail

```javascript
const { logAudit, calculateChanges } = require('../utils/auditLogger');

// Untuk UPDATE operation
const oldData = await getOldData(id);
const newData = await updateData(id, updates);

await logAudit({
  userId: req.user.id,
  tableName: 'users',
  action: 'UPDATE',
  recordId: id,
  oldValues: oldData,
  newValues: newData,
  changes: calculateChanges(oldData, newData),
  detail: `Updated user ${id}`,
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req)
});
```

## Action Types

- `CREATE` - Pembuatan data baru
- `UPDATE` - Perubahan data
- `DELETE` - Penghapusan data
- `LOGIN` - User login
- `LOGOUT` - User logout

## API Endpoints

### Get All Audit Logs (dengan filter dan pagination)

```
GET /api/audit-log?page=1&pageSize=20&tableName=users&action=CREATE&startDate=2024-01-01&endDate=2024-12-31
```

Response:
```json
{
  "success": true,
  "logs": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Audit Logs by User

```
GET /api/audit-log/user/:userId
```

### Export Audit Logs

```
GET /api/audit-log/export?format=csv
GET /api/audit-log/export?format=excel
```

## Contoh Implementasi di Controller

### User Login

```javascript
// userController.js
const { logAudit, getIpAddress, getUserAgent } = require('../utils/auditLogger');

exports.login = async (req, res) => {
  try {
    const user = await authenticateUser(req.body);
    
    // Log successful login
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      detail: `User ${user.username} logged in`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    res.json({ success: true, user, token });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
```

### Data Update

```javascript
// applicationController.js
const { logAudit, getIpAddress, calculateChanges } = require('../utils/auditLogger');

exports.updateApplication = async (req, res) => {
  try {
    const oldData = await getApplication(req.params.id);
    const newData = await updateApplication(req.params.id, req.body);
    
    await logAudit({
      userId: req.user.id,
      tableName: 'data_aplikasi',
      action: 'UPDATE',
      recordId: req.params.id,
      oldValues: oldData,
      newValues: newData,
      changes: calculateChanges(oldData, newData),
      detail: `Updated application ${newData.nama_aplikasi}`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    res.json({ success: true, data: newData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Frontend Usage

Komponen `AuditLogSection` sudah tersedia di `frontend/src/pages/AuditLogSection.jsx`.

Import dan gunakan di routing:

```javascript
import AuditLogSection from './pages/AuditLogSection';

// Di dalam routing
<Route path="/audit-log" element={<AuditLogSection />} />
```

## Best Practices

1. **Selalu log aktivitas penting**: CREATE, UPDATE, DELETE pada data master dan transaksi
2. **Jangan log data sensitif**: Password, token, atau data pribadi yang sangat sensitif
3. **Gunakan detail/description yang jelas**: Memudahkan tracking dan debugging
4. **Handle error gracefully**: Audit logging tidak boleh mengganggu flow utama aplikasi
5. **Regular cleanup**: Pertimbangkan untuk mengarsipkan atau menghapus log lama secara berkala

## Troubleshooting

### Tabel audit_log tidak ditemukan

Jalankan script SQL untuk membuat tabel:
```bash
mysql -u root -p database_name < backend/database/create_audit_log_table.sql
```

### Audit log tidak tersimpan

1. Periksa koneksi database
2. Periksa apakah user_id valid (foreign key constraint)
3. Periksa console untuk error message
4. Pastikan tabel audit_log sudah dibuat dengan struktur yang benar

### Export tidak berfungsi

Pastikan package `exceljs` sudah terinstall:
```bash
cd backend
npm install exceljs
```

## Maintenance

### Cleanup Old Logs

Untuk database yang sibuk, pertimbangkan untuk membuat job/cron untuk cleanup:

```sql
-- Hapus log lebih dari 1 tahun
DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Atau archive ke tabel terpisah
INSERT INTO audit_log_archive SELECT * FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## License

Internal use only - KKP Project
