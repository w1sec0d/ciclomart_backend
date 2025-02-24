// Esta ruta se encarga de escuchar las notificaciones producidas por mercado libre
// como las confirmaciones de los pagos realizados por los usuarios
const db = require('../database/connection')

// Mercado Pago
const { mercadoPagoClient } = require('../utils/mercadoPago')
const { Payment } = require('mercadopago')
const payment = new Payment(mercadoPagoClient)

const webhookMercadoLibre = async (req, res) => {
  try {
    const { body } = req
    console.log('Webhook de Mercado Libre:', body)

    // se recibe una notificacion de confirmacion de pago
    if (body.topic === 'payment') {
      const paymentId = body.resource
      const paymentResponse = await payment.get({ id: paymentId })
      const { status, external_reference } = paymentResponse
      console.log('external_reference', external_reference)
      if (status === 'approved') {
        db.query(
          "UPDATE carrito SET estado='pendiente_envio' WHERE idCarrito = ?",
          [external_reference],
          (err, result) => {
            if (err) {
              console.log(err)
            }
          }
        )
      }
    }

    res.status(200).json({ success: true, message: 'Webhook recibido', body })
  } catch (error) {
    console.error('Error en el servidor', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    })
  }
}

module.exports = webhookMercadoLibre
