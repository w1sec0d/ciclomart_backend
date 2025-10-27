const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')
const { Payment } = require('mercadopago')
const { MercadoPagoConfig } = require('mercadopago')

const webhookMercadoLibre = async (req, res) => {
  console.log('Webhook de Mercado Libre recibido')
  const { body } = req
  console.log('Webhook de Mercado Libre:', JSON.stringify(body, null, 2))

  sendSuccess(res, 'Webhook received', body)

  if (body.action === 'payment.created') {
    try {
      const paymentId = body.data.id
      console.log('=== PROCESANDO PAGO ===')
      console.log('Payment ID:', paymentId)

      // En TEST, buscar el carrito más reciente pendiente de pago para este vendedor
      const carts = await executeQuery(
        `SELECT idCarrito, external_reference 
         FROM carrito 
         WHERE estado='pendiente_pago' 
         AND idVendedor IN (
           SELECT idUsuario FROM usuario WHERE mp_user_id = ?
         )
         ORDER BY fecha DESC 
         LIMIT 1`,
        [body.user_id]
      )

      if (carts && carts.length > 0) {
        const cartId = carts[0].idCarrito

        await executeQuery(
          "UPDATE carrito SET estado='pendiente_envio', idPago = ? WHERE idCarrito = ?",
          [paymentId, cartId]
        )
        console.log('Cart updated successfully:', cartId)
      } else {
        console.log('No se encontró carrito pendiente para este vendedor')
      }

      console.log('=== PAGO PROCESADO EXITOSAMENTE ===')
    } catch (error) {
      console.error('Error processing webhook:', error)
    }
  }
}


module.exports = webhookMercadoLibre