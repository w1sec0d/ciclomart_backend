// This controller is responsible for getting all the transactions (purchases and sales)
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber } = require('../utils/validation')

// Gets all the transactions
const getTransacciones = async (request, response) => {
  try {
    const results = await executeQuery('SELECT * FROM transaccion')
    return sendSuccess(response, 'Transactions obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting transactions')
  }
}

// Gets all the purchases of a given user
const getPurchasesByBuyerId = async (request, response) => {
  try {
    const { buyerId } = request.params

    if (!isValidNumber(buyerId)) {
      return sendError(response, 'Invalid buyer ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [buyerId]
    )

    return sendSuccess(response, 'Purchases obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting purchases')
  }
}

// Gets all the sales of a given user
const getSalesBySellerId = async (request, response) => {
  try {
    const { sellerId } = request.params

    if (!isValidNumber(sellerId)) {
      return sendError(response, 'Invalid seller ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_ventas_usuario WHERE idVendedor = ?',
      [sellerId]
    )

    return sendSuccess(response, 'Sales obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting sales')
  }
}

module.exports = { getTransacciones, getPurchasesByBuyerId, getSalesBySellerId }
