// This route is responsible for shopping cart related operations
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber, validateRequiredFields, validateIds } = require('../utils/validation')

// Gets the shopping cart of a user
const getShoppingCartByBuyerId = async (request, response) => {
  try {
    const { buyerId } = request.params

    if (!isValidNumber(buyerId)) {
      return sendError(response, 'Invalid buyer ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_productos_carrito WHERE id_comprador = ?',
      [buyerId]
    )
    return sendSuccess(response, 'Shopping cart obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting shopping cart')
  }
}

// Adds a product to the shopping cart of a user
const addToShoppingCartByBuyerId = async (request, response) => {
  try {
    const { buyerId, productId, quantity } = request.body

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['buyerId', 'productId', 'quantity'])
    if (!validation.isValid) {
      return sendError(response, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Validate IDs
    const idValidation = validateIds({ buyerId, productId })
    if (!idValidation.isValid) {
      return sendError(response, `Invalid IDs: ${idValidation.invalidIds.join(', ')}`, 400)
    }

    // Validate quantity is a number
    if (!isValidNumber(quantity)) {
      return sendError(response, 'Invalid quantity', 400)
    }

    const carritoResults = await executeQuery(
      'SELECT idCarrito FROM carrito WHERE idComprador = ? AND estado = "pendiente_pago"',
      [buyerId]
    )

    // If the shopping cart is not found, create a new one and add the product to it
    if (carritoResults.length === 0) {
      const newCarrito = await executeQuery(
        'INSERT INTO carrito (idComprador, estado) VALUES (?, "pendiente_pago")',
        [buyerId]
      )
      const idCarrito = newCarrito.insertId
      const results = await executeQuery(
        'INSERT INTO carritoProducto (idCarrito, idProducto, cantidad) VALUES (?, ?, ?)',
        [idCarrito, productId, quantity]
      )
      return sendSuccess(response, 'Product added to the shopping cart', results, 201)
    }
    // If the shopping cart is found, add the product to it 
    else {
      const idCarrito = carritoResults[0].idCarrito
      const carritoProductoResults = await executeQuery(
        'SELECT * FROM carritoProducto WHERE idCarrito = ? AND idProducto = ?',
        [idCarrito, productId]
      )

      if (carritoProductoResults.length > 0) {
        // If the product is already in the shopping cart, update the quantity
        const newQuantity = carritoProductoResults[0].cantidad + quantity
        const results = await executeQuery(
          'UPDATE carritoProducto SET cantidad = ? WHERE idCarrito = ? AND idProducto = ?',
          [newQuantity, idCarrito, productId]
        )
        return sendSuccess(response, 'Quantity of the product updated in the shopping cart', results)
      } else {
        // If the product is not in the shopping cart, add it to it
        const results = await executeQuery(
          'INSERT INTO carritoProducto (idCarrito, idProducto, cantidad) VALUES (?, ?, ?)',
          [idCarrito, productId, quantity]
        )
        return sendSuccess(response, 'Product added to the shopping cart', results, 201)
      }
    }
  } catch (error) {
    return handleError(response, error, 'Error processing shopping cart request')
  }
}

// Removes a product from the shopping cart of a user
const removeFromShoppingCartByBuyerId = async (request, response) => {
  try {
    const { buyerId, productId } = request.params

    // Validate IDs
    const idValidation = validateIds({ buyerId, productId })
    if (!idValidation.isValid) {
      return sendError(response, `Invalid IDs: ${idValidation.invalidIds.join(', ')}`, 400)
    }

    const carritoResults = await executeQuery(
      'SELECT idCarrito FROM carrito WHERE idComprador = ? AND estado = "pendiente_pago"',
      [buyerId]
    )

    if (carritoResults.length === 0) {
      return sendError(response, 'Shopping cart not found', 404)
    }

    const idCarrito = carritoResults[0].idCarrito

    const results = await executeQuery(
      'DELETE FROM carritoProducto WHERE idCarrito = ? AND idProducto = ?',
      [idCarrito, productId]
    )

    if (results.affectedRows === 0) {
      return sendError(response, 'Product not found in the shopping cart', 404)
    }

    return sendSuccess(response, 'Product removed from the shopping cart')
  } catch (error) {
    return handleError(response, error, 'Error removing product from shopping cart')
  }
}

module.exports = { getShoppingCartByBuyerId, addToShoppingCartByBuyerId, removeFromShoppingCartByBuyerId }
