// This controller handles purchase-related operations including viewing, confirming, and canceling purchases
const { refund } = require('../utils/mercadoPago')
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber } = require('../utils/validation')

// Gets all purchases for a specific buyer
const getPurchasesById = async (req, res) => {
  try {
    const { buyerId } = req.params

    if (!isValidNumber(buyerId)) {
      return sendError(res, 'Invalid buyer ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [buyerId]
    )
    return sendSuccess(res, 'Purchases obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting purchases')
  }
}

// Confirms that a shipment has been received by the buyer
const confirmShipment = async (req, res) => {
  try {
    const { idCarrito } = req.params

    if (!isValidNumber(idCarrito)) {
      return sendError(res, 'Invalid cart ID', 400)
    }

    await executeQuery(
      'UPDATE carrito SET estado = "recibido" WHERE idCarrito = ?',
      [idCarrito]
    )
    return sendSuccess(res, 'Shipment confirmed successfully')
  } catch (error) {
    return handleError(res, error, 'Error confirming shipment')
  }
}

// Cancels a purchase and processes a refund if payment was made
const cancelPurchase = async (req, res) => {
  try {
    const { idCarrito } = req.params

    if (!isValidNumber(idCarrito)) {
      return sendError(res, 'Invalid cart ID', 400)
    }

    // Get the payment ID to cancel it
    const results = await executeQuery(
      'SELECT idPago FROM carrito WHERE idCarrito = ?',
      [idCarrito]
    )

    if (results.length === 0) {
      return sendError(res, 'Purchase not found', 404)
    }

    const idPago = results[0].idPago
    console.log('idPago', idPago)

    if (idPago) {
      try {
        const refundResponse = await refund.create({ payment_id: idPago })
        console.log('refundResponse', refundResponse)
      } catch (error) {
        return handleError(res, error, 'Error canceling payment', 'Failed to process refund')
      }
    }

    // Update the cart status to refunded
    await executeQuery('UPDATE carrito SET estado = "reembolsado" WHERE idCarrito = ?', [
      idCarrito,
    ])

    return sendSuccess(res, 'Purchase canceled successfully')
  } catch (error) {
    return handleError(res, error, 'Error canceling purchase')
  }
}

module.exports = {
  getPurchasesById,
  cancelPurchase,
  confirmShipment,
}
