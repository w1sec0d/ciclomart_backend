// This route is responsible for shopping cart related operations
const { executeQuery } = require('../utils/executeQuery.js')

// Gets the shopping cart of a user
const getShoppingCartByBuyerId = async (request, response) => {
  const { buyerId } = request.params
  if (isNaN(buyerId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid buyer ID',
    })
  }

  try {
    const results = await executeQuery(
      'SELECT * FROM vista_productos_carrito WHERE id_comprador = ?',
      [buyerId]
    )
    return response.status(200).json({
      success: true,
      message: 'Shopping cart obtained successfully',
      results,
    })
  } catch (error) {
    console.error('Error executing the query ', error)
    return response.status(500).json({
      success: false,
      message: 'Error getting the shopping cart',
      error: error.message,
    })
  }
}

// Adds a product to the shopping cart of a user
const addToShoppingCartByBuyerId = async (request, response) => {
  const { buyerId, productId, quantity } = request.body

  if (isNaN(buyerId) || isNaN(productId) || isNaN(quantity)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid data',
    })
  }

  try {
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
      return response.status(201).json({
        success: true,
        message: 'Product added to the shopping cart',
        results,
      })
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
        return response.status(200).json({
          success: true,
          message: 'Quantity of the product updated in the shopping cart',
          results,
        })
      } else {
        // If the product is not in the shopping cart, add it to it
        const results = await executeQuery(
          'INSERT INTO carritoProducto (idCarrito, idProducto, cantidad) VALUES (?, ?, ?)',
          [idCarrito, productId, quantity]
        )
        return response.status(201).json({
          success: true,
          message: 'Product added to the shopping cart',
          results,
        })
      }
    }
  } catch (error) {
    console.error('Error executing the query ', error)
    return response.status(500).json({
      success: false,
      message: 'Error processing the request',
      error: error.message,
    })
  }
}

// Removes a product from the shopping cart of a user
const removeFromShoppingCartByBuyerId = async (request, response) => {
  const { buyerId, productId } = request.params

  if (isNaN(buyerId) || isNaN(productId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid data',
    })
  }

  try {
    const carritoResults = await executeQuery(
      'SELECT idCarrito FROM carrito WHERE idComprador = ? AND estado = "pendiente_pago"',
      [buyerId]
    )

    if (carritoResults.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Shopping cart not found',
      })
    }

    const idCarrito = carritoResults[0].idCarrito

    const results = await executeQuery(
      'DELETE FROM carritoProducto WHERE idCarrito = ? AND idProducto = ?',
      [idCarrito, productId]
    )

    if (results.affectedRows === 0) {
      return response.status(404).json({
        success: false,
        message: 'Product not found in the shopping cart',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Product removed from the shopping cart',
    })
  } catch (error) {
    console.error('Error executing the query ', error)
    return response.status(500).json({
      success: false,
      message: 'Error removing the product from the shopping cart',
      error: error.message,
    })
  }
}

module.exports = { getShoppingCartByBuyerId, addToShoppingCartByBuyerId, removeFromShoppingCartByBuyerId }
