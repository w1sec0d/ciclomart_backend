const db = require('../database/connection.js')

// Obtiene todas las tiendas
const getTiendas = async (request, response) => {
  try {
    db.query('SELECT * FROM tienda', (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: 'Server error, no se pueden obtener las tiendas',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Tiendas obtenidas exitosamente',
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
