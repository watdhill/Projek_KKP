const jwt = require("jsonwebtoken");

// Secret key untuk JWT (di production, taruh di .env)
const JWT_SECRET =
  process.env.JWT_SECRET || "kkp-secret-key-2026-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware untuk authenticate token
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Allow requests without token to pass through (backward compatible)
  // This lets existing frontend work while we gradually migrate
  if (!token) {
    // Set req.user = null so routes know this is unauthenticated
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token invalid or expired
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah expired",
      error: "INVALID_TOKEN",
    });
  }
};

// Middleware untuk require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Autentikasi diperlukan. Silakan login terlebih dahulu.",
      error: "AUTHENTICATION_REQUIRED",
    });
  }
  next();
};

// Middleware untuk require specific role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan",
        error: "AUTHENTICATION_REQUIRED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role yang diizinkan: ${allowedRoles.join(", ")}`,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

// Middleware untuk require admin
const requireAdmin = requireRole("Admin");

// Middleware untuk require operator
const requireOperator = requireRole(
  "Operator Eselon 1",
  "Operator Eselon 2",
  "Operator UPT",
);

module.exports = {
  generateToken,
  authenticateToken,
  requireAuth,
  requireRole,
  requireAdmin,
  requireOperator,
  JWT_SECRET,
};
