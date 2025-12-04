/**
 * Middleware to automatically decrypt sensitive fields and remove server secrets from API responses.
 *
 * This middleware intercepts JSON responses and:
 * 1. Removes server-only secrets (tokens, passwords) that should never reach the frontend
 * 2. Decrypts user-visible encrypted fields before sending them to the client
 */

const { decryptFieldAsync, isEncrypted } = require('../utils/encryption')

/**
 * Fields that are server secrets and should NEVER be sent to the frontend.
 * These are removed from responses entirely.
 */
const FIELDS_TO_REMOVE = [
    // MercadoPago OAuth tokens - server secrets
    'mp_access_token',
    'mp_refresh_token',
    // Password hash - never expose to frontend
    'password',
]

/**
 * Fields that should be decrypted before sending to the frontend.
 * These are user-visible fields that need to be readable.
 */
const FIELDS_TO_DECRYPT = [
    // Direct fields from usuario table (user can see their own data)
    'telefono',
    'direccionNombre',
    'direccionNumero',
    'direccionPiso',
    'direccionApartamento',
    // Aliased fields from views
    'telefonoVendedor',
    'direccionEnvio',
]

/**
 * Recursively processes data to:
 * 1. Remove server secrets
 * 2. Decrypt encrypted user-visible fields (supports KMS encryption)
 *
 * @param {any} data - The data to process
 * @returns {Promise<any>} - The processed data (secrets removed, fields decrypted)
 */
async function decryptData(data) {
    // Handle null/undefined
    if (data === null || data === undefined) {
        return data
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return Promise.all(data.map(item => decryptData(item)))
    }

    // Handle objects
    if (typeof data === 'object') {
        const result = {}
        for (const [key, value] of Object.entries(data)) {
            // Skip fields that should be removed (server secrets)
            if (FIELDS_TO_REMOVE.includes(key)) {
                continue // Don't include in result
            }

            // Decrypt fields that the user can see
            if (FIELDS_TO_DECRYPT.includes(key) && typeof value === 'string' && isEncrypted(value)) {
                try {
                    result[key] = await decryptFieldAsync(value)
                } catch (error) {
                    // If decryption fails, keep original value and log warning
                    console.warn(`Warning: Failed to decrypt field '${key}':`, error.message)
                    result[key] = value
                }
            } else if (typeof value === 'object') {
                result[key] = await decryptData(value)
            } else {
                result[key] = value
            }
        }
        return result
    }

    // Return primitives as-is
    return data
}

/**
 * Express middleware that intercepts JSON responses to:
 * 1. Remove server secrets from responses
 * 2. Decrypt encrypted fields for user visibility (including KMS)
 */
function decryptResponseMiddleware(req, res, next) {
    // Store original json method
    const originalJson = res.json.bind(res)

    // Override json method with async handler
    res.json = async function (data) {
        try {
            const processedData = await decryptData(data)
            return originalJson(processedData)
        } catch (error) {
            console.error('Error in decryptResponseMiddleware:', error)
            // If processing fails, send original data
            return originalJson(data)
        }
    }

    next()
}

module.exports = {
    decryptResponseMiddleware,
    decryptData,
    FIELDS_TO_DECRYPT,
    FIELDS_TO_REMOVE
}
