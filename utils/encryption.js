const crypto = require("crypto");

// Clave AES-256 (32 bytes). Debe venir de una variable de entorno.
const AES_KEY = process.env.AES_KEY;

// Prefix for encrypted data (prepared for key versioning)
const ENCRYPTION_PREFIX = "enc:v1:";

if (!AES_KEY || AES_KEY.length !== 32) {
  console.error("ERROR: AES_KEY must be 32 characters (256 bits).");
  process.exit(1);
}

/**
 * Encrypts a string using AES-256-GCM.
 * @param {string} plaintext
 * @returns {object} { iv, ciphertext, tag }
 */
function encrypt(plaintext) {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag(); // Authentication tag (AEAD)

  return {
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: tag.toString("base64")
  };
}

/**
 * Decrypts AES-256-GCM encrypted data.
 * @param {object} encrypted { iv, ciphertext, tag }
 * @returns {string} plaintext
 */
function decrypt(encrypted) {
  if (!encrypted) return null;

  const { iv, ciphertext, tag } = encrypted;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    AES_KEY,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final()
  ]);

  return plaintext.toString("utf8");
}

/**
 * Checks if a value is already encrypted (has the encryption prefix).
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value is encrypted
 */
function isEncrypted(value) {
  if (!value || typeof value !== "string") return false;
  return value.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Encrypts a field value and returns a serialized string for database storage.
 * Returns null for null/undefined values, and returns the original value if already encrypted.
 * @param {string} value - The plaintext value to encrypt
 * @returns {string|null} - Serialized encrypted string with prefix, or null
 */
function encryptField(value) {
  // Handle null/undefined
  if (value === null || value === undefined) return null;

  // Convert to string if not already
  const stringValue = String(value);

  // Skip if empty string
  if (stringValue === "") return "";

  // Skip if already encrypted (idempotent)
  if (isEncrypted(stringValue)) return stringValue;

  const encrypted = encrypt(stringValue);
  if (!encrypted) return null;

  // Serialize to JSON and encode as base64, then add prefix
  const serialized = Buffer.from(JSON.stringify(encrypted)).toString("base64");
  return ENCRYPTION_PREFIX + serialized;
}

/**
 * Decrypts a field value from its serialized database format.
 * Returns the original value if not encrypted (for backwards compatibility).
 * @param {string} encryptedValue - The serialized encrypted string
 * @returns {string|null} - The decrypted plaintext, or original value if not encrypted
 */
function decryptField(encryptedValue) {
  // Handle null/undefined
  if (encryptedValue === null || encryptedValue === undefined) return null;

  // Handle empty string
  if (encryptedValue === "") return "";

  // If not encrypted, return as-is (backwards compatibility with existing data)
  if (!isEncrypted(encryptedValue)) return encryptedValue;

  try {
    // Remove prefix and decode
    const serialized = encryptedValue.slice(ENCRYPTION_PREFIX.length);
    const encrypted = JSON.parse(Buffer.from(serialized, "base64").toString("utf8"));

    return decrypt(encrypted);
  } catch (error) {
    // If decryption fails, throw error (don't silently return corrupted data)
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Gets the current encryption version prefix.
 * Useful for migration scripts and key rotation (future use).
 * @returns {string} - The encryption prefix
 */
function getEncryptionPrefix() {
  return ENCRYPTION_PREFIX;
}

module.exports = {
  encrypt,
  decrypt,
  encryptField,
  decryptField,
  isEncrypted,
  getEncryptionPrefix
};
