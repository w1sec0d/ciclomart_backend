// This controller handles seller-related information and ratings
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber } = require('../utils/validation')

// Gets all the ratings of a seller
const getRatingSeller = async (request, response) => {
  try {
    const { sellerId } = request.params

    if (!isValidNumber(sellerId)) {
      return sendError(response, 'Invalid seller ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_calificaciones_productos_vendedor WHERE idUsuario = ?',
      [sellerId]
    )

    return sendSuccess(response, 'Ratings obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting seller ratings')
  }
}

module.exports = {
  getRatingSeller,
}
