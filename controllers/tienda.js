const db = require('../database/connection.js')

const getTiendas = async (request, response) => {
  db.query('SELECT * FROM tienda', (error, results) => {
    if (error) {
      return response
        .status(404)
        .send({ message: 'Stores cannot be obtained', error: error })
    }
    response.status(200).json(results)
  })
}

module.exports = { getTiendas }
