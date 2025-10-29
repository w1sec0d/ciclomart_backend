// This controller handles product rating and review operations
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber, validateRequiredFields, validateIds } = require('../utils/validation')

// Gets all the ratings for a specific product
const ratingProduct = async (request, response) => {
  try {
    const { productId } = request.params

    if (!isValidNumber(productId)) {
      return sendError(response, 'Invalid product ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_producto_calificacion WHERE idProducto = ?',
      [productId]
    )

    return sendSuccess(response, 'Ratings obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting ratings')
  }
}

// Calculates and returns the average rating of a product
const averageProductRatings = async (request, response) => {
  try {
    const { productId } = request.params

    if (!isValidNumber(productId)) {
      return sendError(response, 'Invalid product ID', 400)
    }

    const results = await executeQuery(
      'SELECT * from vista_producto_calificacion_promedio WHERE idProducto = ?',
      [productId]
    )

    return sendSuccess(response, 'Average rating obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting average rating')
  }
}

// Checks if a user purchased a product before allowing them to rate it
const checkUserPurchase = async (request, response) => {
  try {
    const { buyerId, productId } = request.body

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['buyerId', 'productId'])
    if (!validation.isValid) {
      return sendError(
        response,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      )
    }

    // Validate IDs are valid numbers
    const idValidation = validateIds({ buyerId, productId })
    if (!idValidation.isValid) {
      return sendError(response, `Invalid IDs: ${idValidation.invalidIds.join(', ')}`, 400)
    }

    const results = await executeQuery(
      'SELECT * from vista_compras_usuario WHERE idUsuario = ? AND idProducto = ?',
      [buyerId, productId]
    )

    if (results.length === 0) {
      return sendError(response, 'No purchases found for the user', 404)
    }

    return sendSuccess(response, 'Purchase validation obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error validating purchase')
  }
}

// Adds a new rating/review for a product
const addRatingProduct = async (request, response) => {
  try {
    const { productId, comment, buyerId, sellerId, rating, photo } = request.body

    const query = `INSERT INTO calificacion (idProducto, comentario, idUsuarioComprador, idUsuarioVendedor, nota, foto) VALUES (?, ?, ?, ?, ?, ?)`

    await executeQuery(query, [productId, comment, buyerId, sellerId, rating, photo])

    return sendSuccess(response, 'Rating added successfully', null, 201)
  } catch (error) {
    return handleError(response, error, 'Error adding rating')
  }
}

module.exports = {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
}

