// Validation utilities for common validation patterns

/**
 * Validates if a value is a valid number
 * @param {*} value - Value to validate
 * @returns {Boolean} - True if valid number, false otherwise
 */
const isValidNumber = (value) => {
    const parsed = parseInt(value)
    return !isNaN(parsed) && parsed > 0
}

/**
 * Validates required fields in request body
 * @param {Object} data - Object containing the data to validate
 * @param {Array<String>} requiredFields - Array of required field names
 * @returns {Object} - { isValid: boolean, missingFields: array }
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(
        (field) => !data[field] && data[field] !== 0 && data[field] !== false
    )

    return {
        isValid: missingFields.length === 0,
        missingFields,
    }
}

/**
 * Validates an email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates multiple IDs at once
 * @param {Object} ids - Object with key-value pairs of IDs to validate
 * @returns {Object} - { isValid: boolean, invalidIds: array }
 */
const validateIds = (ids) => {
    const invalidIds = Object.keys(ids).filter((key) => !isValidNumber(ids[key]))

    return {
        isValid: invalidIds.length === 0,
        invalidIds,
    }
}

module.exports = {
    isValidNumber,
    validateRequiredFields,
    isValidEmail,
    validateIds,
}

