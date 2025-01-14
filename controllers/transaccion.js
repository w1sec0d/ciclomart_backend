const db = require('../database/connection.js')

/*Gets all transactions*/
const getTransacciones = (request, response) => {
  db.query('SELECT * FROM transaccion', (error, results) => {
    if (error) {
      return response
        .status(404)
        .json({ message: 'Transactions cannot be obtained', error: error })
    }
    response.status(200).json(results)
  })
}

/*Gets purchases from a given user*/

const getComprasById = (request, response) => {
  const idComprador = request.params.id

  if (isNaN(idComprador)) {
    return response.status(400).json({ message: 'id buyer not found' })
  }

  db.query(
    'SELECT * FROM transaccion WHERE idComprador = ?',
    [idComprador],
    (error, results) => {
      if (error) {
        return response
          .status(404)
          .json({ message: 'Purchases not found', error: error })
      }
      response.status(200).json(results)
    }
  )
}

module.exports = { getTransacciones, getComprasById }
