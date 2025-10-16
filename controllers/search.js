// This route handles product search
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')

// Performs a search for products
const searchProducts = async (request, response) => {
  try {
    const { nombre, tipo } = request.query

    // Build the query based on the type of product
    let query = ''
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

    const results = await executeQuery(query, queryParams)
    return sendSuccess(response, 'Search performed successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error performing search')
  }
}

module.exports = { searchProducts }

