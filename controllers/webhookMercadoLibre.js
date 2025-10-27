const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')
const { Payment } = require('mercadopago')
const { MercadoPagoConfig } = require('mercadopago')

const webhookMercadoLibre = async (req, res) => {
  const { body } = req
  console.log('Webhook de Mercado Libre:', JSON.stringify(body, null, 2))

  sendSuccess(res, 'Webhook received', body)

  if (body.action === 'payment.created') {
    processPayment(body.data.id).catch(error => {
      console.error('Error procesando pago en webhook:', error)
    })
  }
}

async function processPayment(paymentId, retryCount = 0) {
  try {
    console.log('=== PROCESANDO PAGO ===')
    console.log('Payment ID:', paymentId)
    console.log('Intento:', retryCount + 1)

    // Primero, obtener información básica del pago usando las credenciales del integrador
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
      console.error('Error obteniendo info del pago:', error.message)

      // Si es error 404 y aún no hemos reintentado mucho, esperar y reintentar
      if (error.status === 404 && retryCount < 3) {
        const delaySeconds = (retryCount + 1) * 2 // 2s, 4s, 6s
        console.log(`Payment not found, reintentando en ${delaySeconds} segundos...`)

        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000))
        return processPayment(paymentId, retryCount + 1)
      }

      console.log('No se pudo obtener el pago después de varios intentos')
      return
    }

    const { status, external_reference } = paymentInfo

    if (status === 'approved') {
      const [category, idProducto, grade] = external_reference.split('-')

      if (category === 'exposicion') {
        console.log('EXPOSURE PAYMENT RECEIVED', 'PRODUCT ID:', idProducto, 'GRADE:', grade)

        await executeQuery(
          'UPDATE producto SET exposicion = ? WHERE idProducto = ?',
          [grade, idProducto]
        )
        console.log('Product exposure updated successfully')
      } else {
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