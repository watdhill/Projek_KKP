const { body, query, param, validationResult } = require("express-validator");
const validator = require("validator");
const xss = require("xss");
const fs = require("fs");
const path = require("path");

// Helper: Check if master data type is valid (static or dynamic)
const isValidMasterDataType = (type) => {
  // Static types
  const staticTypes = [
    "eselon1",
    "eselon2",
    "upt",
    "cara_akses",
    "frekuensi_pemakaian",
    "status_aplikasi",
    "environment",
    "pdn",
    "pic_internal",
    "pic_eksternal",
    "format_laporan",
  ];

  if (staticTypes.includes(type)) return true;

  // Check dynamic types
  const dynamicConfigPath = path.join(
    __dirname,
    "../config/dynamicTableConfig.json",
  );
  try {
    if (fs.existsSync(dynamicConfigPath)) {
      const dynamicConfig = JSON.parse(
        fs.readFileSync(dynamicConfigPath, "utf8"),
      );
      if (dynamicConfig[type]) return true;
    }
  } catch (err) {
    console.error("Error checking dynamic config:", err);
  }

  return false;
};

// Middleware untuk handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validasi input gagal",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Sanitization helper
const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  // Remove XSS attacks
  let sanitized = xss(value, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
  // Trim whitespace
  sanitized = sanitized.trim();
  return sanitized;
};

// Custom sanitizer middleware
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

// ============================================
// USER VALIDATION RULES
// ============================================

const validateLogin = [
  sanitizeBody,
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email terlalu panjang (max 255 karakter)"),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 1, max: 255 })
    .withMessage("Password tidak valid"),

  handleValidationErrors,
];

const validateCreateUser = [
  sanitizeBody,
  body("nama")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama harus 3-255 karakter")
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage(
      "Nama hanya boleh berisi huruf, spasi, titik, apostrof, dan tanda hubung",
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email terlalu panjang"),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 8, max: 255 })
    .withMessage("Password minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/)
    .withMessage(
      "Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol (tanpa spasi)",
    ),

  body("role_id")
    .notEmpty()
    .withMessage("Role wajib diisi")
    .isInt({ min: 1 })
    .withMessage("Role ID tidak valid"),

  body("eselon1_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 1 ID tidak valid"),

  body("eselon2_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 2 ID tidak valid"),

  body("upt_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("UPT ID tidak valid"),

  body("status_aktif")
    .optional()
    .isIn([0, 1, "0", "1"])
    .withMessage("Status aktif harus 0 atau 1"),

  handleValidationErrors,
];

const validateUpdateUser = [
  sanitizeBody,
  param("id").isInt({ min: 1 }).withMessage("User ID tidak valid"),

  body("nama")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama harus 3-255 karakter")
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage(
      "Nama hanya boleh berisi huruf, spasi, titik, apostrof, dan tanda hubung",
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email terlalu panjang"),

  body("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 255 })
    .withMessage("Password minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/)
    .withMessage(
      "Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol",
    ),

  body("role_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID tidak valid"),

  body("eselon1_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 1 ID tidak valid"),

  body("eselon2_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 2 ID tidak valid"),

  body("upt_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("UPT ID tidak valid"),

  body("status_aktif")
    .optional()
    .isIn([0, 1, "0", "1"])
    .withMessage("Status aktif harus 0 atau 1"),

  handleValidationErrors,
];

const validateChangePassword = [
  sanitizeBody,
  param("id").isInt({ min: 1 }).withMessage("User ID tidak valid"),

  body("oldPassword")
    .notEmpty()
    .withMessage("Password lama wajib diisi")
    .isLength({ max: 255 })
    .withMessage("Password lama tidak valid"),

  body("newPassword")
    .notEmpty()
    .withMessage("Password baru wajib diisi")
    .isLength({ min: 8, max: 255 })
    .withMessage("Password baru minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/)
    .withMessage(
      "Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol",
    ),

  handleValidationErrors,
];

const validateResetPassword = [
  sanitizeBody,
  body("token")
    .notEmpty()
    .withMessage("Token wajib diisi")
    .isLength({ min: 10, max: 500 })
    .withMessage("Token tidak valid"),

  body("newPassword")
    .notEmpty()
    .withMessage("Password baru wajib diisi")
    .isLength({ min: 8, max: 255 })
    .withMessage("Password baru minimal 8 karakter")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/)
    .withMessage(
      "Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol",
    ),

  handleValidationErrors,
];

const validateForgotPassword = [
  sanitizeBody,
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email terlalu panjang"),

  handleValidationErrors,
];

// ============================================
// APLIKASI VALIDATION RULES
// ============================================

const validateCreateAplikasi = [
  body("nama_aplikasi")
    .trim()
    .notEmpty()
    .withMessage("Nama aplikasi wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama aplikasi harus 3-255 karakter"),

  handleValidationErrors,
];

const validateUpdateAplikasi = [
  param("id").notEmpty().withMessage("ID aplikasi wajib diisi"),

  body("nama_aplikasi")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama aplikasi harus 3-255 karakter"),

  handleValidationErrors,
];

// ============================================
// MASTER DATA VALIDATION RULES
// ============================================

const validateMasterDataQuery = [
  query("type")
    .optional()
    .trim()
    .custom((value) => {
      if (!isValidMasterDataType(value)) {
        throw new Error("Type tidak valid");
      }
      return true;
    }),

  query("eselon1_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 1 ID tidak valid"),

  query("eselon2_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Eselon 2 ID tidak valid"),

  query("upt_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("UPT ID tidak valid"),

  query("created_by")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Created by tidak valid"),

  handleValidationErrors,
];

const validateCreateMasterData = [
  sanitizeBody,
  query("type")
    .trim()
    .notEmpty()
    .withMessage("Type wajib diisi")
    .custom((value) => {
      if (!isValidMasterDataType(value)) {
        throw new Error("Type tidak valid");
      }
      return true;
    }),

  body("nama_eselon1")
    .if(query("type").equals("eselon1"))
    .trim()
    .notEmpty()
    .withMessage("Nama Eselon 1 wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama Eselon 1 harus 3-255 karakter"),

  body("nama_eselon2")
    .if(query("type").equals("eselon2"))
    .trim()
    .notEmpty()
    .withMessage("Nama Eselon 2 wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama Eselon 2 harus 3-255 karakter"),

  body("nama_upt")
    .if(query("type").equals("upt"))
    .trim()
    .notEmpty()
    .withMessage("Nama UPT wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Nama UPT harus 3-255 karakter"),

  body("eselon1_id")
    .if(query("type").isIn(["eselon2", "upt"]))
    .isInt({ min: 1 })
    .withMessage("Eselon 1 ID tidak valid"),

  body("status_aktif")
    .optional()
    .isIn([0, 1, "0", "1"])
    .withMessage("Status aktif harus 0 atau 1"),

  handleValidationErrors,
];

const validateUpdateMasterData = [
  sanitizeBody,
  query("type")
    .trim()
    .notEmpty()
    .withMessage("Type wajib diisi")
    .custom((value) => {
      if (!isValidMasterDataType(value)) {
        throw new Error("Type tidak valid");
      }
      return true;
    }),

  param("id").isInt({ min: 1 }).withMessage("ID tidak valid"),

  body("status_aktif")
    .optional()
    .isIn([0, 1, "0", "1"])
    .withMessage("Status aktif harus 0 atau 1"),

  handleValidationErrors,
];

const validateDeleteMasterData = [
  query("type")
    .trim()
    .notEmpty()
    .withMessage("Type wajib diisi")
    .custom((value) => {
      if (!isValidMasterDataType(value)) {
        throw new Error("Type tidak valid");
      }
      return true;
    }),

  param("id").isInt({ min: 1 }).withMessage("ID tidak valid"),

  handleValidationErrors,
];

// ============================================
// GENERIC VALIDATION
// ============================================

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID tidak valid"),
  handleValidationErrors,
];

module.exports = {
  // Helpers
  handleValidationErrors,
  sanitizeBody,
  sanitizeString,

  // User validations
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
  validateResetPassword,
  validateForgotPassword,

  // Aplikasi validations
  validateCreateAplikasi,
  validateUpdateAplikasi,

  // Master data validations
  validateMasterDataQuery,
  validateCreateMasterData,
  validateUpdateMasterData,
  validateDeleteMasterData,

  // Generic validations
  validateId,
};
