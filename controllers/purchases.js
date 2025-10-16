// This controller handles purchase-related operations including viewing, confirming, and canceling purchases
const db = require('../database/connection')
const { refund } = require('../utils/mercadoPago')
const { executeQuery } = require('../utils/dbHelpers')
const { handleError } = require('../utils/responseHandler')

// Gets all purchases for a specific buyer
const getPurchasesById = async (req, res) => {
  const { buyerId } = req.params
  if (!buyerId)
    return res
      .status(400)
      .json({ success: false, message: 'Buyer ID is required' })

  try {
    db.query(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [buyerId],
      (error, results) => {
        if (error) {
          handleError(res, error, 'Error executing the query')
        }
        return res.status(200).json({
          success: true,
          message: 'Purchases obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    handleError(res, error, 'Error getting purchases')
  }
}

// Confirms that a shipment has been received by the buyer
const confirmShipment = async (req, res) => {
  const { idCarrito } = req.params
  if (!idCarrito)
    return res
      .status(400)
      .json({ success: false, message: 'Cart ID is required' })

  try {
    db.query(
      'UPDATE carrito SET estado = "recibido" WHERE idCarrito = ?',
      [idCarrito],
      (error, results) => {
        if (error) {
          handleError(res, error, 'Error executing the query')
        }
        return res.status(200).json({
          success: true,
          message: 'Shipment confirmed successfully',
        })
      }
    )
  } catch (error) {
    handleError(res, error, 'Error confirming shipment')
  }
}

// Cancels a purchase and processes a refund if payment was made
const cancelPurchase = async (req, res) => {
  const { idCarrito } = req.params
  if (!idCarrito) {
    return res
      .status(400)
      .json({ success: false, message: 'Cart ID is required' })
  }

  try {
    // Get the payment ID to cancel it
    const results = await executeQuery(
      'SELECT idPago FROM carrito WHERE idCarrito = ?',
      [idCarrito]
    )
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Purchase not found' })
    }

    const idPago = results[0].idPago
    console.log('idPago', idPago)
    if (idPago) {
      try {
        const refundResponse = await refund.create({ payment_id: idPago })
        console.log('refundResponse', refundResponse)
      } catch (error) {
        return handleError(res, error, 'Error canceling payment')
      }
    }

    // Update the cart status to refunded
    await executeQuery('UPDATE carrito SET estado = "reembolsado" WHERE idCarrito = ?', [
      idCarrito,
    ])
    res.status(200).json({
      success: true,
      message: 'Purchase canceled successfully',
    })
  } catch (error) {
    handleError(res, error, 'Error executing the query')
  }
}

module.exports = {
  getPurchasesById,
  cancelPurchase,
  confirmShipment,
}
