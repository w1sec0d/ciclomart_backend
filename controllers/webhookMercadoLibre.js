const { mercadoPagoClient } = require('../utils/mercadoPago')
const { Payment } = require('mercadopago')
const payment = new Payment(mercadoPagoClient)

const webhookMercadoLibre = async (req, res) => {
  console.log('Recibiendo webhook de Mercado Libre')
  try {
    const { body } = req
    console.log('Webhook de Mercado Libre:', body)

    if (body.topic === 'payment') {
      const paymentId = body.resource
      const paymentResponse = await payment.get({ id: paymentId })
      const { status } = paymentResponse
      if (status === 'approved') {
        console.log('Pago aprobado:', paymentResponse)
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
