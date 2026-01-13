# 📘 Prisma Migration - Panduan Lengkap untuk Tim

> **Status:** ✅ Production Ready  
> **Setup Date:** 12 Januari 2026  
> **Prisma Version:** 7.2.0

---

## 📋 Daftar Isi

1. [Setup Awal](#setup-awal)
2. [Workflow Kolaborasi](#workflow-kolaborasi)
3. [Command Reference](#command-reference)
4. [Troubleshooting](#troubleshooting)
5. [File Structure](#file-structure)

---

## ✅ Setup Awal (Sudah Selesai)

Prisma sudah dikonfigurasi dengan:
- ✓ Initial migration dari database existing
- ✓ Prisma Client generated
- ✓ NPM scripts untuk migration commands

---

## 🔄 Workflow Kolaborasi Tim dengan Prisma Migrate

### **Scenario 1: Developer Menambah Field/Tabel Baru**

#### Developer yang Buat Perubahan:

**1. Edit Prisma Schema**
```bash
# Edit file: backend/prisma/schema.prisma
# Contoh: Tambah field baru ke model users
```

Contoh perubahan:
```prisma
model users {
  user_id      BigInt   @id @default(autoincrement())
  nama         String
  email        String   @unique
  
  // Field baru yang ditambahkan
  no_telepon   String?  @db.VarChar(20)
  created_at   DateTime @default(now())
  
  // ... field lainnya
}
```

**2. Generate Migration**
```bash
cd backend
npm run prisma:migrate
```

Saat diminta nama migration, berikan nama deskriptif:
```
✔ Enter a name for the new migration: › add_phone_and_timestamp_to_users
```

**3. Review Migration File**
- Prisma akan generate file SQL di `prisma/migrations/[timestamp]_add_phone_and_timestamp_to_users/`
- **PENTING:** Buka dan review file `migration.sql` untuk memastikan benar
- Jika ada default value atau data transformation, edit manual jika perlu

**4. Commit ke Git**
```bash
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/
git commit -m "Migration: add phone number and timestamps to users table"
git push origin main
```

---

### **Scenario 2: Anggota Tim Lain Dapat Update**

#### Developer Lain (Menarik Perubahan):

**1. Pull dari Git**
```bash
git pull origin main
```

**2. Jalankan Migration**
```bash
cd backend
npm run prisma:migrate
```

Prisma akan:
- Deteksi migration baru yang belum dijalankan
- Jalankan SQL script secara otomatis
- Update database lokal mereka

**3. Generate Prisma Client (Jika Perlu)**
```bash
npm run prisma:generate
```

**Selesai!** Database mereka sudah up-to-date dengan perubahan terbaru.

---

### **Scenario 3: Menambah Data Master (Roles, Eselon, dll)**

Untuk data yang perlu di-share ke tim (bukan migration schema), ada 2 cara:

#### **Opsi A: Seed File (Recommended)**

**1. Buat/Update Seed Script**
```javascript
// backend/prisma/seed.js
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Upsert roles
  await prisma.roles.upsert({
    where: { role_id: 5 },
    update: {},
    create: {
      role_id: 5,
      nama_role: 'Auditor',
      deskripsi: 'Role untuk auditor internal'
    }
  });

  // Upsert eselon
  await prisma.master_eselon1.upsert({
    where: { eselon1_id: 4 },
    update: {},
    create: {
      eselon1_id: 4,
      nama_eselon1: 'Unit Baru',
      singkatan: 'UB',
      status_aktif: true
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**2. Update package.json**
```json
"scripts": {
  "prisma:seed": "node prisma/seed.js"
}
```

**3. Jalankan Seed**
```bash
npm run prisma:seed
```

**4. Commit ke Git**
```bash
git add backend/prisma/seed.js
git commit -m "Seed: add new role and eselon unit"
git push
```

**5. Anggota Tim Lain**
```bash
git pull
cd backend
npm run prisma:seed
```

---

#### **Opsi B: Data Migration (untuk Data Kritis)**

Jika data harus sync dengan schema change, masukkan ke migration:

**1. Generate Empty Migration**
```bash
npx prisma migrate dev --create-only --name add_new_roles
```

**2. Edit Migration SQL**
```sql
-- prisma/migrations/[timestamp]_add_new_roles/migration.sql

INSERT INTO roles (role_id, nama_role, deskripsi)
VALUES (5, 'Auditor', 'Role untuk auditor internal')
ON DUPLICATE KEY UPDATE nama_role = VALUES(nama_role);

INSERT INTO master_eselon1 (eselon1_id, nama_eselon1, singkatan, status_aktif)
VALUES (4, 'Unit Baru', 'UB', TRUE)
ON DUPLICATE KEY UPDATE nama_eselon1 = VALUES(nama_eselon1);
```

**3. Apply Migration**
```bash
npx prisma migrate dev
```

**4. Commit dan Push** (sama seperti scenario 1)

---

## 🛠️ Command Reference

| Perintah | Fungsi |
|----------|--------|
| `npm run prisma:migrate` | Buat migration baru & apply ke DB lokal |
| `npm run prisma:generate` | Generate Prisma Client setelah schema berubah |
| `npm run prisma:studio` | Buka GUI untuk lihat/edit data (localhost:5555) |
| `npm run prisma:pull` | Pull schema dari database ke schema.prisma |
| `npm run prisma:push` | Push schema.prisma ke DB (tanpa migration, dev only) |

---

## ⚠️ Penting untuk Tim

### **DO's ✅**
1. **Selalu pull dulu** sebelum buat migration baru
2. **Review migration SQL** sebelum commit
3. **Beri nama migration yang jelas** (misal: `add_user_phone`, bukan `update1`)
4. **Test migration di lokal** sebelum push
5. **Commit schema.prisma dan migrations/** bersamaan
6. **Komunikasikan** perubahan besar ke tim via chat/standup

### **DON'Ts ❌**
1. **Jangan edit migration yang sudah di-push**
2. **Jangan hapus folder migrations/** (history penting!)
3. **Jangan commit file `.env`** (sudah di gitignore)
4. **Jangan pakai `db push`** untuk production/staging
5. **Jangan skip migration** kalau ada conflict (diskusikan tim)

---

## 🐛 Troubleshooting

### Error: "Migration already applied"
```bash
# Reset migration status (dev only!)
npx prisma migrate reset
```

### Error: "Out of sync"
```bash
# Regenerate client
npm run prisma:generate
```

### Database berbeda dengan schema?
```bash
# Pull schema dari DB
npm run prisma:pull

# Atau push schema ke DB (hati-hati!)
npm run prisma:push
```

### Rollback Migration (Emergency)
```bash
# Prisma tidak support rollback otomatis
# Manual: Edit database atau restore dari backup

# Alternatif: Buat migration baru yang undo perubahan
npx prisma migrate dev --name revert_previous_change
```

---

## 📊 Struktur Folder Prisma

```
backend/
├── prisma/
│   ├── schema.prisma          # Source of truth untuk database structure
│   ├── seed.js               # Script untuk insert data master
│   ├── migrations/           # History semua perubahan database
│   │   ├── 0_init/
│   │   │   └── migration.sql
│   │   ├── 20260112_add_phone_to_users/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── prisma.config.ts      # Config untuk Prisma 7
└── src/
    └── generated/
        └── prisma/           # Generated Prisma Client (jangan edit!)
```

---

## 🚀 Next Steps

1. **Buat seed file** untuk data master yang sudah ada
2. **Setup CI/CD** untuk auto-run migrations di staging/production
3. **Database backup** sebelum run migration di production
4. **Documentation** untuk setiap migration yang kompleks

---

**Dibuat:** 12 Januari 2026  
**Last Updated:** 12 Januari 2026  
**Maintainer:** Tim KKP Backend
