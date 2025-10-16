// Standarized response handlers for consistent API responses

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {*} data - Optional data to include
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
    }
    // If data is not null, add it to the response
    if (data !== null) {
        response.results = data
    }

    return res.status(statusCode).json(response)
}

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Object} error - Optional error object
 */
const sendError = (res, message, statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
    }

    if (error) {
        response.error = error.message || error
    }

    return res.status(statusCode).json(response)
}

/**
 * Handles errors consistently - logs and sends error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {String} logMessage - Message to log to console
 * @param {String} userMessage - Optional custom message for user (defaults to generic message)
 */
const handleError = (res, error, logMessage, userMessage = 'Internal server error') => {
    console.error(logMessage, error)
    return sendError(res, userMessage, 500, error)
}

module.exports = {
    sendSuccess,
    sendError,
    handleError,
}

