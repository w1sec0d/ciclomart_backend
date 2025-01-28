const db = require('../database/connection.js')

// Obtiene todas las tiendas
const getTiendas = async (request, response) => {
  db.query('SELECT * FROM tienda', (error, results) => {
    if (error) {
      return response.status(500).json({
        success: false,
        message: 'Error en el servidor, no se pueden obtener las tiendas',
        error: error.message,
      })
    }
    return response.status(200).json({
      success: true,
      message: 'Tiendas obtenidas exitosamente',
      data: results,
    })
  })
}

module.exports = { getTiendas }
