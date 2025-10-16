// This controller handles product rating and review operations
const db = require('../database/connection')

// Gets all the ratings for a specific product
const ratingProduct = (request, response) => {
  const { productId } = request.params
  const parsedProductId = parseInt(productId)

  if (isNaN(parsedProductId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid product ID',
    })
  }

  db.query(
    'SELECT * FROM vista_producto_calificacion WHERE idProducto = ?',
    [parsedProductId],
    (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Server error, try again later',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Ratings obtained successfully',
        results,
      })
    }
  )
}

// Calculates and returns the average rating of a product
const averageProductRatings = (request, response) => {
  const { productId } = request.params
  const parsedProductId = parseInt(productId)

  db.query(
    'SELECT * from vista_producto_calificacion_promedio WHERE idProducto = ?',
    [parsedProductId],
    (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Server error. Try again later',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Average rating obtained successfully',
        results,
      })
    }
  )
}

// Checks if a user purchased a product before allowing them to rate it
const checkUserPurchase = (request, response) => {
  const { buyerId, productId } = request.body
  const parsedBuyerId = parseInt(buyerId)
  const parsedProductId = parseInt(productId)

  if (!parsedBuyerId || !parsedProductId) {
    return response.status(400).json({
      success: false,
      message: 'The buyerId and productId are required',
    })
  }

  db.query(
    'SELECT * from vista_compras_usuario WHERE idUsuario = ? AND idProducto = ?',
    [parsedBuyerId, parsedProductId],
    (error, results) => {
      if (error) {
        console.error('Error executing the validation', error)
        return response.status(500).json({
          success: false,
          message: 'Server error. Try again later',
          error: error.message,
        })
      }

      if (results.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No purchases found for the user',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Purchase validation obtained successfully',
        results,
      })
    }
  )
}

// Adds a new rating/review for a product
const addRatingProduct = (request, response) => {
  const {
    productId,
    comment,
    buyerId,
    sellerId,
    rating,
    photo,
  } = request.body
  const parsedProductId = parseInt(productId)
  const parsedBuyerId = parseInt(buyerId)
  const parsedSellerId = parseInt(sellerId)
  const parsedRating = parseInt(rating)
  const query = `INSERT INTO calificacion (idProducto,comentario, idUsuarioComprador, idUsuarioVendedor, nota, foto) VALUES (?, ?, ?, ?, ?, ?)`

  db.query(
    query,
    [parsedProductId, comment, parsedBuyerId, parsedSellerId, parsedRating, photo],
    (error, results) => {
      if (error) {
        console.error('Error executing the insertion', error)
        return response.status(500).json({
          success: false,
          message: 'Server error. Try again later',
          error: error.message,
        })
      }

      return response.status(201).json({
        success: true,
        message: 'Rating added successfully',
      })
    }
  )
}

module.exports = {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
}
