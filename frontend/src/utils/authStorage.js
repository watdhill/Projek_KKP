/**
 * Helpers untuk penyimpanan auth di localStorage.
 * Fokus: hindari "logout" tidak sengaja karena token tersimpan sebagai "null"/"undefined".
 */

const AUTH_KEYS = [
  "token",
  "userRole",
  "userEmail",
  "userId",
  "userName",
  "eselon1_id",
  "eselon2_id",
  "upt_id",
  "namaEselon1",
  "namaEselon2",
  "namaUPT",
];

const isProbablyJwt = (token) => {
  if (typeof token !== "string") return false;
  // JWT biasanya 3 segmen base64url dipisah titik
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  return parts.every((p) => typeof p === "string" && p.length > 0);
};

export const getStoredToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;

  const token = String(raw).trim();
  if (!token) return null;
  if (token === "null" || token === "undefined") return null;

  return isProbablyJwt(token) ? token : null;
};

export const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const hasValidStoredToken = () => {
  return !!getStoredToken();
};
