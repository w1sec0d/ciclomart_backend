// This route is responsible for store related operations
const db = require('../database/connection.js')

// Gets all the stores
const getTiendas = async (request, response) => {
  try {
    db.query('SELECT * FROM tienda', (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: 'Server error, cannot get the stores',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Stores obtained successfully',
        results,
      })
    })
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

module.exports = { getTiendas }
