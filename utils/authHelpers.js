// Authentication helper utilities
const jwt = require('jsonwebtoken')

/**
 * Extracts and validates Bearer token from Authorization header
 * @param {Object} request - Express request object
 * @returns {Object} - { token: string, error: string|null }
 */
const extractBearerToken = (request) => {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            token: null,
            error: 'No token provided or invalid format',
        }
    }

    const token = authHeader.split(' ')[1]
    return {
        token,
        error: null,
    }
}

/**
 * Verifies a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyJwtToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const expiredError = new Error('Token has expired')
            expiredError.name = 'TokenExpiredError'
            throw expiredError
        }
        throw error
    }
}

/**
 * Creates a JWT token
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Expiration time (e.g., '1h', '7d')
 * @returns {String} - JWT token
 */
const createJwtToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
    const { token, error } = extractBearerToken(req)

    if (error) {
        return res.status(401).json({
            success: false,
            message: error,
        })
    }

    try {
        const decoded = verifyJwtToken(token)
        req.user = decoded
        next()
    } catch (error) {
        const message = error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
        return res.status(401).json({
            success: false,
            message,
            error: error.message,
        })
    }
}

module.exports = {
    extractBearerToken,
    verifyJwtToken,
    createJwtToken,
    authenticateToken,
}

