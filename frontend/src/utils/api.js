// API utility untuk handle JWT authentication

import { clearAuthStorage, getStoredToken } from "./authStorage";

/**
 * Get auth headers with JWT token
 * @returns {Object} Headers object with Authorization bearer token
 */
export const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Fetch dengan auth headers otomatis
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const authFetch = async (url, options = {}) => {
  const headers = getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // Handle token expiration (JWT invalid/expired)
  if (response.status === 403) {
    const data = await response.json();
    if (data.error === "INVALID_TOKEN") {
      clearAuthStorage();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getStoredToken();
};

/**
 * Logout user - clear localStorage and redirect
 */
export const logout = () => {
  clearAuthStorage();
  window.location.href = "/login";
};

export default {
  getAuthHeaders,
  authFetch,
  isAuthenticated,
  logout,
};
