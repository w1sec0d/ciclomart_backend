// This route is responsible of product search
const db = require('../database/connection')

// Performs a search for products
const searchProducts = (request, response) => {
  try {
    const { nombre, tipo } = request.query

    // Build the query based on the type of product
    let query = ``
    const queryParams = []

    // If the type of product is provided, join the product with the type of product
    if (tipo) {
      query = `SELECT * FROM vista_completa_producto INNER JOIN ${tipo} ON vista_completa_producto.idProducto = ${tipo}.id${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
    } else {
      query = `SELECT * FROM vista_completa_producto WHERE 1=1`
    }

    // If the name of the product is provided, add the name to the query
    if (nombre) {
      query += ' AND LOWER(nombre) LIKE LOWER(?)'
      queryParams.push(`%${nombre}%`)
    }

    db.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Search performed successfully',
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

module.exports = { searchProducts }
