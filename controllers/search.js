const db = require('../database/connection')

const search = (request, response) => {
  const { nombre, tipo } = request.query

  let query = ``
  const queryParams = []

  if (tipo) {
    query = `SELECT * FROM producto INNER JOIN ${tipo} ON producto.idProducto = ${tipo}.id${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
  } else {
    query = `SELECT * FROM producto WHERE 1=1`
  }

  if (nombre) {
    query += ' AND LOWER(nombre) LIKE LOWER(?)'
    queryParams.push(`%${nombre}%`)
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing query', error)
      response.status(500).send('Internal server error')
      return
    }
    response.json(results)
    console.log(results)
  })
}

module.exports = { search }
