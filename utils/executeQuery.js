// Helper function to execute a query and return a promise
const db = require('../database/connection')

const executeQuery = (query, params) => {
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

module.exports = executeQuery