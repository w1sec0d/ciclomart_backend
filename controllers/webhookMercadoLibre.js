// This route is responsible for listening to notifications produced by Mercado Pago (Payment Gateway)
// like the payment confirmations made by the users
const db = require('../database/connection')
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
          db.query(
            'UPDATE producto SET exposicion = ? WHERE idProducto = ?',
            [grade, idProducto],
            (err, result) => {
              if (err) {
                console.error('Error updating product:', err)
              } else {
                console.log('Product updated successfully:', result)
              }
            }
          )
        } else {
          // If the payment is for a purchase, update the cart status
          db.query(
            "UPDATE carrito SET estado='pendiente_envio', idPago = ? WHERE idCarrito = ?",
            [paymentId, external_reference],
            (err, result) => {
              if (err) {
                console.error(err)
              }
            }
          )
        }
      }
    }

    res.status(200).json({ success: true, message: 'Webhook received', body })
  } catch (error) {
    console.error('Server error', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

module.exports = webhookMercadoLibre
