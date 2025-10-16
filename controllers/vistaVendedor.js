// This controller handles seller-related information and ratings
const db = require('../database/connection')

// Gets all the ratings of a seller
const getRatingSeller = async (request, response) => {
  let sellerId = parseInt(request.params.sellerId)

  if (isNaN(sellerId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid seller ID',
    })
  }

  db.query(
    'SELECT * FROM vista_calificaciones_productos_vendedor WHERE idUsuario = ?',
    [sellerId],
    (error, results) => {
      if (error) {
        console.error('Error performing the query', error)
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

module.exports = {
  getRatingSeller,
}
