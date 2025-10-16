// This route is responsible for listening to notifications produced by Mercado Pago (Payment Gateway)
// like the payment confirmations made by the users
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')
const { mercadoPagoClient } = require('../utils/mercadoPago')
const { Payment } = require('mercadopago')
const payment = new Payment(mercadoPagoClient)

const webhookMercadoLibre = async (req, res) => {
  try {
    const { body } = req
    console.log('Webhook de Mercado Libre:', body)

    // a notification of payment confirmation is received
    if (body.action === 'payment.created') {
      const paymentId = body.data.id
      const paymentResponse = await payment.get({ id: paymentId })
      const { status, external_reference } = paymentResponse
      console.log('paymentResponse', paymentResponse)

      if (status === 'approved') {
        const [category, idProducto, grade] = external_reference.split('-')

        if (category === 'exposicion') {
          // If the payment is for an exposure, update the product exposure
          console.log(
            'EXPOSURE PAYMENT RECEIVED',
            'CATEGORY',
            category,
            'PRODUCT ID',
            idProducto,
            'GRADE',
            grade
          )

          await executeQuery(
            'UPDATE producto SET exposicion = ? WHERE idProducto = ?',
            [grade, idProducto]
          )
          console.log('Product updated successfully')
        } else {
          // If the payment is for a purchase, update the cart status
          await executeQuery(
            "UPDATE carrito SET estado='pendiente_envio', idPago = ? WHERE idCarrito = ?",
            [paymentId, external_reference]
          )
          console.log('Cart status updated successfully')
        }
      }
    }

    return sendSuccess(res, 'Webhook received', body)
  } catch (error) {
    return handleError(res, error, 'Error processing webhook')
  }
}

module.exports = webhookMercadoLibre
