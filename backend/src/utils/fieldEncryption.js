const crypto = require("crypto");

const parseKey = (raw) => {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  // Prefer hex if it looks like hex(64)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  // Otherwise treat as base64
  try {
    const buf = Buffer.from(trimmed, "base64");
    return buf.length ? buf : null;
  } catch {
    return null;
  }
};

const getAkunPasswordKey = () => {
  const key = parseKey(process.env.AKUN_PASSWORD_ENCRYPTION_KEY);
  if (!key) return null;
  if (key.length !== 32) return null;
  return key;
};

const encryptAkunPassword = (plaintext) => {
  const key = getAkunPasswordKey();
  if (!key) {
    const err = new Error(
      "Missing/invalid AKUN_PASSWORD_ENCRYPTION_KEY (must be 32-byte hex(64) or base64)",
    );
    err.code = "ENCRYPTION_KEY_MISSING";
    throw err;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // v1:<ivB64>:<tagB64>:<cipherB64>
  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
};

const decryptAkunPassword = (packed) => {
  const key = getAkunPasswordKey();
  if (!key) {
    const err = new Error(
      "Missing/invalid AKUN_PASSWORD_ENCRYPTION_KEY (must be 32-byte hex(64) or base64)",
    );
    err.code = "ENCRYPTION_KEY_MISSING";
    throw err;
  }

  const raw = String(packed || "").trim();
  if (!raw) return "";

  const parts = raw.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") {
    const err = new Error("Invalid encrypted format");
    err.code = "ENCRYPTION_FORMAT_INVALID";
    throw err;
  }

  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ciphertext = Buffer.from(parts[3], "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
};

module.exports = {
  encryptAkunPassword,
  decryptAkunPassword,
};
