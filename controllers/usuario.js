// controller for user
const db = require('../database/connection')

const getUsuarios = (request, response) => {
  db.query('SELECT * FROM usuario', (error, results) => {
    if (error) {
      console.error('Error executing query', error)
      response.status(500).send('Internal server error')
      return
    }
    response.json(results)
  })
}

module.exports = { getUsuarios }
