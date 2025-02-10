const db = require('../database/connection')
// importa mercadoPagoClient
const { preference } = require('../utils/mercadoPago')

const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM vista_completa_producto', (error, results) => {
      if (error) {
        console.error('Error obteniendo productos:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo productos',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
    })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
      })
    }

    db.query(
      'SELECT * FROM vista_completa_producto WHERE idProducto = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error obteniendo producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo producto',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Producto obtenido exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: error.message,
    })
  }
}

const createPreference = async (req, res) => {
  try {
    const { title, quantity, unit_price, idComprador, idProducto } = req.body
    console.log('title', title)

    // Crear carrito
    const carritoQuery = `
      INSERT INTO carrito (idUsuario, cantidadProductos, precioTotal, fecha, estado, metodoPago, direccionEnvio, descuento)
      VALUES (?, ?, ?, NOW(), 'pendiente', ?, ?, ?)
    `
    const carritoValues = [idComprador, quantity, unit_price * quantity, 'MercadoPago', 'Direccion de envio', 0]

    db.query(carritoQuery, carritoValues, (error, carritoResults) => {
      if (error) {
        console.error('Error creando carrito:', error)
        return res.status(500).json({
          success: false,
          message: 'Error creando carrito',
          error: error.message,
        })
      }

      const carritoId = carritoResults.insertId

      // Crear carritoProducto
      const carritoProductoQuery = `
        INSERT INTO carritoProducto (idProducto, idCarrito, cantidad, precio_unitario, direccion, estadoEnvio)
        VALUES (?, ?, ?, ?, ?, 'Pendiente')
      `
      const carritoProductoValues = [idProducto, carritoId, quantity, unit_price, 'Direccion de envio']

      db.query(carritoProductoQuery, carritoProductoValues, async (error, carritoProductoResults) => {
        if (error) {
          console.error('Error creando carritoProducto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error creando carritoProducto',
            error: error.message,
          })
        }

        const preferenceBody = {
          items: [
            {
              title,
              quantity: Number(quantity),
              unit_price: Number(unit_price),
              currency_id: 'COP',
            },
          ],
          back_urls: {
            success: process.env.FRONTEND_URL + '/requestResult/purchaseComplete',
            failure: process.env.FRONTEND_URL + '/requestResult/purchaseFailed',
            pending: process.env.FRONTEND_URL + '/requestResult/purchasePending',
          },
          auto_return: 'approved',
        }
        console.log('preferenceBody', preferenceBody)
        const result = await preference.create({
          body: preferenceBody,
        })

        return res.status(200).json({
          success: true,
          message: 'Preferencia de MercadoPago creada exitosamente',
          preferenceId: result.id,
          paymentURL: result.init_point,
          result,
        })


      })
    })
  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    res.status(500).json({
      success: false,
      message: 'Error creando preferencia de MercadoPago',
      error: error.message,
    })
  }
}

module.exports = { getProducto, getProductById, createPreference }
