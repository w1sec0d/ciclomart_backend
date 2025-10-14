const db = require('../database/connection')

// Realiza una búsqueda de productos
const search = (request, response) => {
  try {
    const { nombre, tipo } = request.query

    let query = ``
    const queryParams = []

    if (tipo) {
      query = `SELECT * FROM vista_completa_producto INNER JOIN ${tipo} ON vista_completa_producto.idProducto = ${tipo}.id${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
    } else {
      query = `SELECT * FROM vista_completa_producto WHERE 1=1`
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
          message: 'Internal server error',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Búsqueda realizada exitosamente',
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

module.exports = { search }
