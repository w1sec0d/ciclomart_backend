const crypto = require("crypto");

/**
 * Multi-version key encryption module.
 * Supports key rotation by maintaining multiple key versions.
 * 
 * Environment variables:
 * - AES_KEY (legacy, treated as v1)
 * - AES_KEY_V1, AES_KEY_V2, ... (versioned keys)
 * - AES_CURRENT_VERSION (e.g., "v1", "v2") - version for new encryptions
 */

// Load versioned keys from environment
const KEYS = {};
const KEY_PATTERN = /^AES_KEY(?:_V(\d+))?$/;

// Load all AES keys from environment
for (const [envName, value] of Object.entries(process.env)) {
  const match = envName.match(KEY_PATTERN);
  if (match && value) {
    // AES_KEY (no version) is treated as v1
    const version = match[1] ? `v${match[1]}` : "v1";
    if (value.length === 32) {
      KEYS[version] = value;
    } else {
      console.warn(`Warning: ${envName} must be 32 characters, ignoring.`);
    }
  }
}

// Current version for new encryptions (default to highest version or v1)
const CURRENT_VERSION = process.env.AES_CURRENT_VERSION ||
  Object.keys(KEYS).sort().pop() || "v1";

// Validate that we have at least one key
if (Object.keys(KEYS).length === 0) {
  console.error("ERROR: No valid AES keys found. Set AES_KEY or AES_KEY_V1 (32 characters).");
  process.exit(1);
}

// Validate current version exists
if (!KEYS[CURRENT_VERSION]) {
  console.error(`ERROR: AES_CURRENT_VERSION=${CURRENT_VERSION} but no key found for this version.`);
  console.error(`Available versions: ${Object.keys(KEYS).join(", ")}`);
  process.exit(1);
}

/**
 * Gets the encryption prefix for a specific version.
 * @param {string} version - Key version (e.g., "v1", "v2")
 * @returns {string} - The prefix (e.g., "enc:v1:")
 */
function getVersionPrefix(version) {
  return `enc:${version}:`;
}

/**
 * Extracts the version from an encrypted value.
 * @param {string} encryptedValue - The encrypted string
 * @returns {string|null} - The version (e.g., "v1", "kms") or null if not encrypted
 */
function extractVersion(encryptedValue) {
  if (!encryptedValue || typeof encryptedValue !== "string") return null;
  // Match both versioned (enc:v1:) and KMS (enc:kms:) formats
  const match = encryptedValue.match(/^enc:(v\d+|kms):/);
  return match ? match[1] : null;
}

/**
 * Checks if a value is encrypted (has any version prefix, including KMS).
 * @param {string} value - The value to check
 * @returns {boolean} - True if encrypted
 */
function isEncrypted(value) {
  return extractVersion(value) !== null;
}

/**
 * Checks if a value is encrypted with KMS.
 * @param {string} value - The value to check
 * @returns {boolean} - True if KMS encrypted
 */
function isKmsEncrypted(value) {
  return extractVersion(value) === "kms";
}

/**
 * Gets the key for a specific version.
 * @param {string} version - Key version
 * @returns {string} - The key
 * @throws {Error} - If key not found
 */
function getKeyForVersion(version) {
  const key = KEYS[version];
  if (!key) {
    throw new Error(`No key found for version ${version}. Available: ${Object.keys(KEYS).join(", ")}`);
  }
  return key;
}

/**
 * Encrypts a string using AES-256-GCM with a specific key.
 * @param {string} plaintext - Text to encrypt
 * @param {string} key - 32-character key
 * @returns {object} { iv, ciphertext, tag }
 */
function encryptWithKey(plaintext, key) {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: tag.toString("base64")
  };
}

/**
 * Decrypts AES-256-GCM encrypted data with a specific key.
 * @param {object} encrypted { iv, ciphertext, tag }
 * @param {string} key - 32-character key
 * @returns {string} plaintext
 */
function decryptWithKey(encrypted, key) {
  if (!encrypted) return null;

  const { iv, ciphertext, tag } = encrypted;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
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
 * Encrypts using current version key.
 * @param {string} plaintext
 * @returns {object} { iv, ciphertext, tag }
 */
function encrypt(plaintext) {
  return encryptWithKey(plaintext, getKeyForVersion(CURRENT_VERSION));
}

/**
 * Decrypts using current version key (for backwards compatibility).
 * @param {object} encrypted { iv, ciphertext, tag }
 * @returns {string} plaintext
 */
function decrypt(encrypted) {
  return decryptWithKey(encrypted, getKeyForVersion(CURRENT_VERSION));
}

/**
 * Encrypts a field value for database storage using current version.
 * @param {string} value - Plaintext value
 * @returns {string|null} - Encrypted string with version prefix
 */
function encryptField(value) {
  if (value === null || value === undefined) return null;

  const stringValue = String(value);
  if (stringValue === "") return "";

  // Skip if already encrypted (idempotent)
  if (isEncrypted(stringValue)) return stringValue;

  const encrypted = encrypt(stringValue);
  if (!encrypted) return null;

  const serialized = Buffer.from(JSON.stringify(encrypted)).toString("base64");
  return getVersionPrefix(CURRENT_VERSION) + serialized;
}

/**
 * Decrypts a field value, auto-detecting the version from prefix.
 * For KMS-encrypted data, use decryptFieldAsync instead.
 * @param {string} encryptedValue - Encrypted string from database
 * @returns {string|null} - Decrypted plaintext
 */
function decryptField(encryptedValue) {
  if (encryptedValue === null || encryptedValue === undefined) return null;
  if (encryptedValue === "") return "";

  // If not encrypted, return as-is (backwards compatibility)
  const version = extractVersion(encryptedValue);
  if (!version) return encryptedValue;

  // KMS requires async - throw helpful error
  if (version === "kms") {
    throw new Error("KMS-encrypted data requires decryptFieldAsync()");
  }

  try {
    const key = getKeyForVersion(version);
    const prefix = getVersionPrefix(version);
    const serialized = encryptedValue.slice(prefix.length);
    const encrypted = JSON.parse(Buffer.from(serialized, "base64").toString("utf8"));

    return decryptWithKey(encrypted, key);
  } catch (error) {
    throw new Error(`Decryption failed (${version}): ${error.message}`);
  }
}

/**
 * Async version of decryptField that supports KMS encryption.
 * @param {string} encryptedValue - Encrypted string from database
 * @returns {Promise<string|null>} - Decrypted plaintext
 */
async function decryptFieldAsync(encryptedValue) {
  if (encryptedValue === null || encryptedValue === undefined) return null;
  if (encryptedValue === "") return "";

  const version = extractVersion(encryptedValue);
  if (!version) return encryptedValue;

  // Handle KMS encryption
  if (version === "kms") {
    try {
      const { AWSKMSKeyProvider } = require("./providers/awsKmsProvider");
      const kmsProvider = new AWSKMSKeyProvider();
      return await kmsProvider.decryptField(encryptedValue);
    } catch (error) {
      throw new Error(`KMS decryption failed: ${error.message}`);
    }
  }

  // Handle local versioned encryption
  try {
    const key = getKeyForVersion(version);
    const prefix = getVersionPrefix(version);
    const serialized = encryptedValue.slice(prefix.length);
    const encrypted = JSON.parse(Buffer.from(serialized, "base64").toString("utf8"));

    return decryptWithKey(encrypted, key);
  } catch (error) {
    throw new Error(`Decryption failed (${version}): ${error.message}`);
  }
}

/**
 * Re-encrypts a value with a new version key.
 * Useful for key rotation scripts.
 * @param {string} encryptedValue - Currently encrypted value
 * @param {string} targetVersion - Target version (default: current)
 * @returns {string} - Re-encrypted value with new version
 */
function reEncryptField(encryptedValue, targetVersion = CURRENT_VERSION) {
  if (!encryptedValue || !isEncrypted(encryptedValue)) {
    // Not encrypted, encrypt with target version
    return encryptFieldWithVersion(encryptedValue, targetVersion);
  }

  const currentVersion = extractVersion(encryptedValue);
  if (currentVersion === targetVersion) {
    // Already using target version
    return encryptedValue;
  }

  // Decrypt with old key, encrypt with new key
  const plaintext = decryptField(encryptedValue);
  return encryptFieldWithVersion(plaintext, targetVersion);
}

/**
 * Encrypts a field with a specific version.
 * @param {string} value - Plaintext value
 * @param {string} version - Target version
 * @returns {string|null} - Encrypted value
 */
function encryptFieldWithVersion(value, version) {
  if (value === null || value === undefined) return null;

  const stringValue = String(value);
  if (stringValue === "") return "";

  const key = getKeyForVersion(version);
  const encrypted = encryptWithKey(stringValue, key);
  if (!encrypted) return null;

  const serialized = Buffer.from(JSON.stringify(encrypted)).toString("base64");
  return getVersionPrefix(version) + serialized;
}

/**
 * Gets the current encryption version.
 * @returns {string} - Current version (e.g., "v1")
 */
function getCurrentVersion() {
  return CURRENT_VERSION;
}

/**
 * Gets all available key versions.
 * @returns {string[]} - Array of versions
 */
function getAvailableVersions() {
  return Object.keys(KEYS).sort();
}

/**
 * Gets the encryption prefix for current version.
 * @returns {string} - The prefix
 */
function getEncryptionPrefix() {
  return getVersionPrefix(CURRENT_VERSION);
}

module.exports = {
  // Core functions
  encrypt,
  decrypt,
  encryptField,
  decryptField,
  decryptFieldAsync, // Async version for KMS support
  isEncrypted,
  isKmsEncrypted,

  // Version-aware functions
  encryptWithKey,
  decryptWithKey,
  encryptFieldWithVersion,
  reEncryptField,
  extractVersion,

  // Utility functions
  getCurrentVersion,
  getAvailableVersions,
  getEncryptionPrefix,
  getVersionPrefix,
  getKeyForVersion
};
