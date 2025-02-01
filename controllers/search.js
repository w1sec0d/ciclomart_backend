const db = require('../database/connection')

// Realiza una búsqueda de productos
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
      console.error('Error ejecutando la consulta', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
    }
    return response.status(200).json({
      success: true,
      message: 'Búsqueda realizada exitosamente',
      results,
    })
  })
}

module.exports = { search }
