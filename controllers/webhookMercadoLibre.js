const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')

const webhookMercadoLibre = async (req, res) => {
  console.log('Webhook de Mercado Libre recibido')
  const { body } = req
  console.log('Webhook de Mercado Libre:', JSON.stringify(body, null, 2))

  // Responder 200 inmediatamente
  sendSuccess(res, 'Webhook received', body)

  // Procesar el pago de forma asíncrona
  if (body.action === 'payment.created' && body.type === 'payment') {
    processPayment(body).catch(error => {
      console.error('Error procesando webhook:', error)
    })
  }
}

async function processPayment(body) {
  try {
    const paymentId = body.data.id
    const vendorUserId = body.user_id

    console.log('=== PROCESANDO PAGO ===')
    console.log('Payment ID:', paymentId)
    console.log('Vendor User ID:', vendorUserId)

    // PASO 1: Intentar encontrar un carrito pendiente (compra normal)
    const carts = await executeQuery(
      `SELECT c.idCarrito, c.idVendedor, u.nombre, u.apellido, u.mp_user_id
       FROM carrito c
       JOIN usuario u ON c.idVendedor = u.idUsuario
       WHERE c.estado = 'pendiente_pago' 
       AND u.mp_user_id = ?
       ORDER BY c.fecha DESC 
       LIMIT 1`,
      [vendorUserId]
    )

    if (carts && carts.length > 0) {
      // Es una COMPRA NORMAL
      const cart = carts[0]
      console.log('💳 COMPRA NORMAL DETECTADA')
      console.log('Carrito encontrado:', {
        idCarrito: cart.idCarrito,
        vendedor: `${cart.nombre} ${cart.apellido}`
      })

      await executeQuery(
        "UPDATE carrito SET estado = 'pendiente_envio', idPago = ? WHERE idCarrito = ?",
        [paymentId, cart.idCarrito]
      )

      console.log('✅ Carrito actualizado exitosamente')
      console.log('=== PAGO PROCESADO EXITOSAMENTE ===')
      return
    }

    // PASO 2: Si no hay carrito, buscar si hay productos del vendedor esperando exposición
    console.log('No se encontró carrito pendiente, verificando si es pago de exposición...')

    const productosPendientes = await executeQuery(
      `SELECT p.idProducto, p.nombre, p.exposicion, u.mp_user_id
       FROM producto p
       JOIN usuario u ON p.idVendedor = u.idUsuario
       WHERE u.mp_user_id = ?
       AND p.exposicion = 0
       ORDER BY p.fechaPublicacion DESC
       LIMIT 1`,
      [vendorUserId]
    )

    if (productosPendientes && productosPendientes.length > 0) {
      // Es un pago de EXPOSICIÓN
      const producto = productosPendientes[0]
      console.log('🎯 PAGO DE EXPOSICIÓN DETECTADO')
      console.log('Producto:', {
        idProducto: producto.idProducto,
        nombre: producto.nombre
      })

      // Determinar el grado de exposición según el monto
      // Deberías tener esta lógica guardada o usar un valor por defecto
      // Por ahora usamos grado 1 como default
      const grade = 1

      await executeQuery(
        'UPDATE producto SET exposicion = ? WHERE idProducto = ?',
        [grade, producto.idProducto]
      )

      console.log('✅ Exposición del producto actualizada')
      console.log('=== PAGO PROCESADO EXITOSAMENTE ===')
      return
    }

    console.log('⚠️  No se encontró ni carrito ni producto para procesar')

  } catch (error) {
    console.error('❌ Error fatal en processPayment:', error)
    console.error('Stack trace:', error.stack)
  }
}

module.exports = webhookMercadoLibre