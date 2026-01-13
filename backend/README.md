# Backend - Projek KKP

Backend server untuk aplikasi KKP menggunakan Express.js, MySQL, dan Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- Git

### Setup Awal

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env dengan database credentials Anda

# 3. Jalankan migrations
npm run prisma:migrate

# 4. Seed data master
npm run prisma:seed

# 5. Start development server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm run prisma:migrate` | Buat & apply migration |
| `npm run prisma:seed` | Isi data master |
| `npm run prisma:studio` | Buka GUI database (port 5555) |
| `npm run prisma:generate` | Generate Prisma Client |

---

## 🗂️ Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.js            # Data seeding
│   └── migrations/        # Migration history
├── src/
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── .env                   # Environment variables
├── package.json
└── PRISMA_WORKFLOW.md    # Panduan lengkap Prisma
```

---

## 🔧 Environment Variables

```env
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kkp_db
DATABASE_URL="mysql://root:@localhost:3306/kkp_db"
```

---

## 📚 API Endpoints

### Dashboard
- `GET /api/dashboard/statistics` - Statistik dashboard

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Master Data
- `GET /api/master/roles` - Get all roles
- `GET /api/master/eselon1` - Get eselon 1 list
- `GET /api/master/eselon2` - Get eselon 2 list

### Aplikasi
- `GET /api/aplikasi` - Get all applications

---

## 🤝 Workflow untuk Tim

### Pull Update dari Git
```bash
git pull origin main
cd backend
npm run prisma:migrate    # Apply migrations
npm install               # Update dependencies jika ada
```

### Buat Perubahan Database
```bash
# 1. Edit prisma/schema.prisma
# 2. Generate migration
npm run prisma:migrate
# 3. Commit & push
git add prisma/
git commit -m "Migration: describe changes"
git push
```

**Dokumentasi lengkap:** Lihat [PRISMA_WORKFLOW.md](./PRISMA_WORKFLOW.md)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **Database:** MySQL 8
- **ORM:** Prisma 7.2.0
- **Auth:** (TBD)

---

## 📄 License

ISC
