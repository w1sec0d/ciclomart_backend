// Database helper utilities for common database operations
const db = require('../database/connection')

/**
 * Executes a query and returns a promise
 * @param {String} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Promise that resolves with query results
 */
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

/**
 * Finds a user by ID
 * @param {Number} userId - User ID
 * @returns {Promise<Object>} - User object or null
 */
const findUserById = async (userId) => {
    const results = await executeQuery('SELECT * FROM usuario WHERE idUsuario = ?', [userId])
    return results.length > 0 ? results[0] : null
}

/**
 * Finds a user by email
 * @param {String} email - User email
 * @returns {Promise<Object>} - User object or null
 */
const findUserByEmail = async (email) => {
    const results = await executeQuery('SELECT * FROM usuario WHERE correo = ?', [email])
    return results.length > 0 ? results[0] : null
}

/**
 * Checks if a record exists
 * @param {String} table - Table name
 * @param {String} column - Column name to check
 * @param {*} value - Value to check for
 * @returns {Promise<Boolean>} - True if exists
 */
const recordExists = async (table, column, value) => {
    const results = await executeQuery(`SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`, [value])
    return results.length > 0
}

/**
 * Gets a single record by ID
 * @param {String} table - Table name
 * @param {String} idColumn - ID column name
 * @param {Number} id - ID value
 * @returns {Promise<Object>} - Record or null
 */
const findById = async (table, idColumn, id) => {
    const results = await executeQuery(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id])
    return results.length > 0 ? results[0] : null
}

/**
 * Updates a record by ID
 * @param {String} table - Table name
 * @param {String} idColumn - ID column name
 * @param {Number} id - ID value
 * @param {Object} updates - Object with column-value pairs to update
 * @returns {Promise} - Update results
 */
const updateById = async (table, idColumn, id, updates) => {
    const columns = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = columns.map((col) => `${col} = ?`).join(', ')

    const query = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`
    return executeQuery(query, [...values, id])
}

/**
 * Inserts a new record
 * @param {String} table - Table name
 * @param {Object} data - Object with column-value pairs
 * @returns {Promise} - Insert results with insertId
 */
const insert = async (table, data) => {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = columns.map(() => '?').join(', ')

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    return executeQuery(query, values)
}

module.exports = {
    executeQuery,
    findUserById,
    findUserByEmail,
    recordExists,
    findById,
    updateById,
    insert,
}

