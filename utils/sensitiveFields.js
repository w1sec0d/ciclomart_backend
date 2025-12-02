/**
 * Sensitive Fields Configuration
 * 
 * Defines which fields should be encrypted for each table.
 * Used by dbHelpers.js for automatic encryption/decryption.
 */

const { encryptField, decryptField } = require("./encryption");

/**
 * Map of table names to their sensitive fields that require encryption.
 * Add new tables/fields here as needed.
 */
const SENSITIVE_FIELDS = {
    usuario: [
        "telefono",
        "direccionNombre",
        "direccionNumero",
        "direccionPiso",
        "direccionApartamento",
        "mp_access_token",
        "mp_refresh_token"
    ],
    // Future tables can be added here:
    // tienda: ["telefono"],
    // carrito: ["direccionEnvio"],
};

/**
 * Gets the list of sensitive fields for a given table.
 * @param {string} table - The table name
 * @returns {string[]} - Array of sensitive field names, or empty array
 */
function getSensitiveFields(table) {
    return SENSITIVE_FIELDS[table] || [];
}

/**
 * Checks if a field is sensitive for a given table.
 * @param {string} table - The table name
 * @param {string} field - The field name
 * @returns {boolean} - True if the field is sensitive
 */
function isSensitiveField(table, field) {
    const fields = getSensitiveFields(table);
    return fields.includes(field);
}

/**
 * Encrypts sensitive fields in a data object before INSERT/UPDATE.
 * Only encrypts fields that are defined as sensitive for the given table.
 * Non-sensitive fields and fields not present in the data are left unchanged.
 * 
 * @param {string} table - The table name
 * @param {object} data - The data object with field-value pairs
 * @returns {object} - New object with sensitive fields encrypted
 */
function encryptSensitiveFields(table, data) {
    if (!data || typeof data !== "object") return data;

    const sensitiveFields = getSensitiveFields(table);
    if (sensitiveFields.length === 0) return data;

    const result = { ...data };

    for (const field of sensitiveFields) {
        if (field in result && result[field] !== null && result[field] !== undefined) {
            result[field] = encryptField(result[field]);
        }
    }

    return result;
}

/**
 * Decrypts sensitive fields in a data object after SELECT.
 * Only decrypts fields that are defined as sensitive for the given table.
 * Non-sensitive fields are left unchanged.
 * 
 * @param {string} table - The table name
 * @param {object} data - The data object with field-value pairs (possibly encrypted)
 * @returns {object} - New object with sensitive fields decrypted
 */
function decryptSensitiveFields(table, data) {
    if (!data || typeof data !== "object") return data;

    const sensitiveFields = getSensitiveFields(table);
    if (sensitiveFields.length === 0) return data;

    const result = { ...data };

    for (const field of sensitiveFields) {
        if (field in result && result[field] !== null && result[field] !== undefined) {
            try {
                result[field] = decryptField(result[field]);
            } catch (error) {
                // Log error but don't fail - field might not be encrypted yet
                console.error(`Warning: Failed to decrypt ${table}.${field}:`, error.message);
                // Keep original value if decryption fails
            }
        }
    }

    return result;
}

/**
 * Decrypts sensitive fields in an array of data objects.
 * Useful for SELECT queries that return multiple rows.
 * 
 * @param {string} table - The table name
 * @param {object[]} rows - Array of data objects
 * @returns {object[]} - New array with sensitive fields decrypted
 */
function decryptSensitiveFieldsArray(table, rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map(row => decryptSensitiveFields(table, row));
}

module.exports = {
    SENSITIVE_FIELDS,
    getSensitiveFields,
    isSensitiveField,
    encryptSensitiveFields,
    decryptSensitiveFields,
    decryptSensitiveFieldsArray
};

