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
    processPayment(body.data.id).catch(error => {
      console.error('Error procesando pago en webhook:', error)
    })
  }
}

async function processPayment(paymentId) {
  try {
    console.log('=== PROCESANDO PAGO ===')
    console.log('Payment ID:', paymentId)

    // Primero, obtener información básica del pago usando las credenciales del integrador
    // para saber a qué vendedor pertenece
    const integratorClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    })
    const integratorPayment = new Payment(integratorClient)

    let paymentInfo
    try {
      paymentInfo = await integratorPayment.get({ id: paymentId })
      console.log('Payment info obtenida:', {
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        collector_id: paymentInfo.collector_id
      })
    } catch (error) {
      console.error('Error obteniendo info del pago con credenciales del integrador:', error.message)
      // Si falla con las credenciales del integrador, intentar obtener el vendedor desde external_reference
      // o desde la base de datos
      console.log('Intentando procesar sin consultar a MercadoPago primero...')
      return
    }

    const { status, external_reference } = paymentInfo

    if (status === 'approved') {
      const [category, idProducto, grade] = external_reference.split('-')

      if (category === 'exposicion') {
        // Si el pago es para exposición, actualizar el producto
        console.log('EXPOSURE PAYMENT RECEIVED', 'PRODUCT ID:', idProducto, 'GRADE:', grade)

        await executeQuery(
          'UPDATE producto SET exposicion = ? WHERE idProducto = ?',
          [grade, idProducto]
        )
        console.log('Product exposure updated successfully')
      } else {
        // Si el pago es para una compra, actualizar el carrito
        console.log('PURCHASE PAYMENT RECEIVED', 'CART ID:', external_reference, 'PAYMENT ID:', paymentId)

        await executeQuery(
          "UPDATE carrito SET estado='pendiente_envio', idPago = ? WHERE idCarrito = ?",
          [paymentId, external_reference]
        )
        console.log('Cart status updated successfully')
      }
    } else {
      console.log('Payment status is not approved:', status)
    }

    console.log('=== PAGO PROCESADO EXITOSAMENTE ===')
  } catch (error) {
    console.error('Error fatal en processPayment:', error)
    console.error('Stack trace:', error.stack)
  }
}

module.exports = webhookMercadoLibre