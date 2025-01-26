const db = require('../database/connection.js')

// Obtiene todas las tiendas
const getTiendas = async (request, response) => {
  db.query('SELECT * FROM tienda', (error, results) => {
    if (error) {
      return response.status(500).send({
        message: 'Error en el servidor, no se pueden obtener las tiendas',
        error: error,
      })
    }
    response.status(200).json(results)
  })
}

module.exports = { getTiendas }
