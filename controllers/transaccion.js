// This route is responsible for getting all the transactions (purchases and sales)
const db = require('../database/connection.js')

// Gets all the transactions
const getTransacciones = (request, response) => {
  try {
    db.query('SELECT * FROM transaccion', (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message:
            'Internal server error, cannot get the transactions',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Transactions obtained successfully',
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

// Gets all the purchases of a given user
const getPurchasesByBuyerId = (request, response) => {
  try {
    const buyerId = request.params.id

    if (isNaN(buyerId)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid buyer ID',
      })
    }

    db.query(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [buyerId],
      (error, results) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: 'Error, cannot get the purchases',
            error: error.message,
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Purchases obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Gets all the sales of a given user
const getSalesBySellerId = (request, response) => {
  try {
    const sellerId = request.params.id
    if (isNaN(sellerId)) {
      return response
        .status(400)
        .json({ message: 'Invalid sellerId ID', success: false })
    }
    db.query(
      'SELECT * FROM vista_ventas_usuario WHERE idVendedor = ? ',
      [sellerId],
      (error, results) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: 'Server error, cannot get the sales',
            error: error.message,
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Sales obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

module.exports = { getTransacciones, getPurchasesByBuyerId, getSalesBySellerId }
