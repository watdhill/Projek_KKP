# 📚 Documentation Index

Comprehensive documentation for Projek KKP - Sistem Manajemen Aplikasi

---

## 🚀 Getting Started

### Setup & Configuration
- **[Backend Setup & API](../backend/README.md)**  
  Express.js backend installation, environment setup, and API reference

- **[Frontend Setup](../frontend/README.md)**  
  React + Vite frontend installation and development guide

- **[Prisma Workflow Guide](./PRISMA_WORKFLOW.md)**  
  Database migrations, schema updates, and Prisma best practices

---

## 🔐 Security Documentation

### Authentication & Authorization
- **[JWT Implementation](./security/JWT_IMPLEMENTATION.md)**  
  Complete guide to JWT-based authentication system
  - Token generation & validation
  - Role-based access control
  - Session management
  - Security best practices

### Password Security
- **[Bcrypt Implementation](./security/BCRYPT_IMPLEMENTATION.md)**  
  Secure password hashing with bcrypt
  - Password hashing workflow
  - Migration from plain text
  - Salt rounds configuration
  - Comparison methods

### Input Security
- **[Input Validation & Sanitization](./security/INPUT_VALIDATION.md)**  
  Protection against XSS and SQL injection attacks
  - XSS prevention with sanitization
  - Validation rules by endpoint
  - Type & format validation
  - Length limits & whitelist validation
  - Error handling

---

## 🎯 Feature Documentation

### Dashboard & Tracking
- **[Application Updates Tracking](./features/APPLICATION_UPDATES_TRACKING.md)**  
  Dashboard update history system
  - Database schema (`application_updates` table)
  - CREATE vs UPDATE tracking
  - Dashboard display logic
  - Performance optimization
  - Archival recommendations

---

## 🗂️ Architecture & Structure

### Project Structure
```
Projek_KKP/
├── backend/              # Express.js + Prisma + MySQL
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation, error handling
│   │   └── utils/        # Helper functions
│   ├── prisma/           # Database schema & migrations
│   └── database/         # Legacy SQL migrations
├── frontend/             # React + Vite
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route pages
│       └── utils/        # Frontend utilities
└── docs/                 # This documentation
    ├── security/         # Security implementation docs
    └── features/         # Feature-specific docs
```

---

## 🔑 Key Concepts

### Security Layer
The application implements a multi-layered security approach:

1. **Authentication** (JWT) - Identity verification with stateless tokens
2. **Password Hashing** (Bcrypt) - Irreversible password storage with salt
3. **Input Validation** (express-validator) - Request sanitization & validation
4. **Authorization** - Role-based access control (Admin, Operator roles)

### Data Tracking
Two complementary tracking systems:

- **Audit Log** (`audit_log` table) - Complete CRUD activity for compliance
- **Application Updates** (`application_updates` table) - Dashboard display history

---

## 📖 Common Tasks

### Adding New API Endpoint
1. Define validation rules in `backend/src/middleware/validate.js`
2. Create controller in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Apply middleware: `router.post('/endpoint', validation, auth, controller)`

### Database Schema Changes
1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update seed data if needed
4. Document changes

### Security Checklist for New Features
- [ ] Input validation & sanitization applied
- [ ] Authentication required (`authenticateToken`)
- [ ] Authorization checked (`requireRole`)
- [ ] Audit log records activity
- [ ] Error messages don't leak sensitive info
- [ ] SQL queries use parameterized statements

---

## 🔧 Maintenance

### Regular Tasks
- **Weekly**: Review audit logs for suspicious activity
- **Monthly**: Check `application_updates` table size, archive if needed
- **Quarterly**: Update dependencies (`npm audit fix`)
- **Yearly**: Rotate JWT secret, review security configurations

### Troubleshooting Guides
- **Login fails**: Check JWT secret, token expiration, bcrypt comparison
- **Validation errors**: Review rules in `validate.js`, check error messages
- **Dashboard not updating**: Verify `application_updates` table, check controller logging
- **Database issues**: See Prisma Workflow Guide

---

## 🤝 Contributing

### Documentation Standards
- Use clear, concise language
- Include code examples
- Explain "why" not just "how"
- Keep up-to-date with code changes

### Adding New Documentation
1. Create file in appropriate folder (`security/`, `features/`, etc.)
2. Add entry to this INDEX.md
3. Link from main README.md if high-priority
4. Use consistent formatting

---

## 📞 Support

For questions or issues:
- Check relevant documentation section above
- Review code comments in implementation files
- Create GitHub issue for bugs/feature requests

---

**Last Updated:** February 18, 2026  
**Project:** Sistem Informasi Manajemen Aplikasi KKP  
**Repository:** [watdhill/Projek_KKP](https://github.com/watdhill/Projek_KKP)
