// Frontend Error Handler untuk handle API errors secara konsisten

/**
 * Handle API errors dan return object dengan informasi error yang user-friendly
 * @param {Error | Response} error - Error object atau response object
 * @returns {Object} - { title, message, type, shouldLogout }
 */
export const handleApiError = (error) => {
  // Network error (tidak bisa connect ke server)
  if (!error.response && error.message) {
    return {
      title: "Koneksi Gagal",
      message:
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      type: "error",
      shouldLogout: false,
    };
  }

  // Untuk fetch API yang tidak throw error otomatis
  if (error.status || error.ok === false) {
    const status = error.status;
    const data = error.data || {};

    return handleHttpError(status, data);
  }

  // Generic error
  return {
    title: "Error",
    message: error.message || "Terjadi kesalahan yang tidak diketahui",
    type: "error",
    shouldLogout: false,
  };
};

/**
 * Handle HTTP error berdasarkan status code
 */
const handleHttpError = (status, data) => {
  switch (status) {
    case 400:
      return {
        title: "Input Tidak Valid",
        message: data.message || "Data yang Anda masukkan tidak valid",
        errors: data.errors || [],
        type: "warning",
        shouldLogout: false,
      };

    case 401:
      return {
        title: "Sesi Berakhir",
        message:
          data.message || "Sesi Anda telah berakhir. Silakan login kembali.",
        type: "error",
        shouldLogout: true,
      };

    case 403:
      return {
        title: "Akses Ditolak",
        message:
          data.message || "Anda tidak memiliki izin untuk melakukan aksi ini",
        type: "error",
        shouldLogout: false,
      };

    case 404:
      return {
        title: "Data Tidak Ditemukan",
        message: data.message || "Data yang Anda cari tidak ditemukan",
        type: "warning",
        shouldLogout: false,
      };

    case 409:
      return {
        title: "Data Duplikat",
        message: data.message || "Data sudah terdaftar dalam sistem",
        type: "warning",
        shouldLogout: false,
      };

    case 422:
      return {
        title: "Validasi Gagal",
        message: data.message || "Validasi data gagal",
        errors: data.errors || [],
        type: "warning",
        shouldLogout: false,
      };

    case 500:
      return {
        title: "Server Error",
        message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
        type: "error",
        shouldLogout: false,
      };

    case 503:
      return {
        title: "Layanan Tidak Tersedia",
        message:
          "Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
        type: "error",
        shouldLogout: false,
      };

    default:
      return {
        title: "Error",
        message: data.message || `Terjadi kesalahan (${status})`,
        type: "error",
        shouldLogout: false,
      };
  }
};

/**
 * Wrapper untuk fetch yang otomatis handle errors
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Promise} - Response JSON atau throw error
 */
export const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Attach status ke data untuk handleApiError
      data.status = response.status;
      const errorInfo = handleApiError(data);

      // Auto logout jika 401
      if (errorInfo.shouldLogout) {
        localStorage.clear();
        window.location.href = "/login";
      }

      // Throw error dengan info yang sudah di-format
      const error = new Error(errorInfo.message);
      error.errorInfo = errorInfo;
      throw error;
    }

    return data;
  } catch (error) {
    // Jika sudah ada errorInfo, langsung throw
    if (error.errorInfo) {
      throw error;
    }

    // Jika network error, process dengan handleApiError
    const errorInfo = handleApiError(error);
    const formattedError = new Error(errorInfo.message);
    formattedError.errorInfo = errorInfo;
    throw formattedError;
  }
};

/**
 * Show notification based on error info
 * @param {Object} errorInfo - Error info dari handleApiError
 * @param {Function} showAlert - Function untuk show alert/notification
 */
export const showErrorNotification = (errorInfo, showAlert) => {
  if (showAlert) {
    showAlert(errorInfo.message, errorInfo.type || "error");
  } else {
    // Fallback ke alert browser
    alert(`${errorInfo.title}: ${errorInfo.message}`);
  }
};

/**
 * Parse validation errors dari response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} - { field: message }
 */
export const parseValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
};

export default {
  handleApiError,
  fetchWithErrorHandling,
  showErrorNotification,
  parseValidationErrors,
};
