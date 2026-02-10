// Custom Error Classes untuk berbagai jenis error

class AppError extends Error {
  constructor(message, statusCode, errorCode = "APP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Error yang expected/di-handle
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request (input tidak valid)
class BadRequestError extends AppError {
  constructor(message = "Input tidak valid") {
    super(message, 400, "BAD_REQUEST");
  }
}

// 401 - Unauthorized (tidak terautentikasi)
class UnauthorizedError extends AppError {
  constructor(message = "Autentikasi diperlukan") {
    super(message, 401, "UNAUTHORIZED");
  }
}

// 403 - Forbidden (tidak punya permission)
class ForbiddenError extends AppError {
  constructor(message = "Akses ditolak") {
    super(message, 403, "FORBIDDEN");
  }
}

// 404 - Not Found (data tidak ditemukan)
class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super(message, 404, "NOT_FOUND");
  }
}

// 409 - Conflict (data duplikat atau konflik lainnya)
class ConflictError extends AppError {
  constructor(message = "Data sudah terdaftar") {
    super(message, 409, "CONFLICT");
  }
}

// 422 - Unprocessable Entity (validasi gagal)
class ValidationError extends AppError {
  constructor(message = "Validasi gagal", errors = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

// 503 - Service Unavailable (database down, dll)
class DatabaseError extends AppError {
  constructor(message = "Database tidak dapat terhubung") {
    super(message, 503, "DATABASE_ERROR");
  }
}

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode || err.code || "INTERNAL_SERVER_ERROR";

  // Log error untuk debugging
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId || "guest",
    ip: req.ip,
    error: {
      name: err.name,
      message: err.message,
      code: error.errorCode,
      statusCode: error.statusCode,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });

  // Handle specific MySQL errors
  if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
    error = new ConflictError("Data sudah terdaftar di sistem");

    // Extract field name dari error message jika bisa
    if (err.sqlMessage && err.sqlMessage.includes("Duplicate entry")) {
      const match = err.sqlMessage.match(
        /Duplicate entry '(.+?)' for key '(.+?)'/,
      );
      if (match) {
        error.message = `Data '${match[1]}' sudah terdaftar`;
      }
    }
  }

  // MySQL foreign key constraint error
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    error = new ConflictError(
      "Data tidak dapat dihapus karena masih digunakan oleh data lain",
    );
  }

  // MySQL connection error
  if (err.code === "ECONNREFUSED" || err.errno === "ECONNREFUSED") {
    error = new DatabaseError(
      "Tidak dapat terhubung ke database. Silakan coba lagi nanti.",
    );
  }

  // MySQL table doesn't exist
  if (err.code === "ER_NO_SUCH_TABLE") {
    error = new DatabaseError("Tabel database tidak ditemukan");
  }

  // MySQL unknown column
  if (err.code === "ER_BAD_FIELD_ERROR") {
    error = new BadRequestError("Field yang diminta tidak valid");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new UnauthorizedError("Token tidak valid");
  }

  if (err.name === "TokenExpiredError") {
    error = new UnauthorizedError(
      "Token sudah expired. Silakan login kembali.",
    );
  }

  // Bcrypt errors
  if (err.name === "bcrypt Error") {
    error = new BadRequestError("Error saat memproses password");
  }

  // Encryption / configuration errors
  if (err.code === "ENCRYPTION_KEY_MISSING") {
    error = new AppError(
      "Konfigurasi enkripsi belum di-set. Set env AKUN_PASSWORD_ENCRYPTION_KEY (32-byte hex(64) atau base64), lalu restart backend.",
      500,
      "ENCRYPTION_KEY_MISSING",
    );
  }

  if (err.code === "ENCRYPTION_FORMAT_INVALID") {
    error = new AppError(
      "Format data terenkripsi tidak valid. Hubungi admin atau periksa data di database.",
      500,
      "ENCRYPTION_FORMAT_INVALID",
    );
  }

  // Validation errors dari express-validator (jika ada)
  if (err.name === "ValidationError") {
    error = new ValidationError(err.message, err.errors);
  }

  // Send error response
  const response = {
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
    errorCode: error.errorCode,
  };

  // Tambahkan validation errors jika ada
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  // Hanya tampilkan stack trace di development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.originalError = err.message;
  }

  res.status(error.statusCode).json(response);
};

// Not Found Handler (untuk route yang tidak ada)
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} tidak ditemukan`);
  next(error);
};

module.exports = {
  // Error Classes
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  DatabaseError,

  // Middleware
  errorHandler,
  notFoundHandler,
};
