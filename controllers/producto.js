const db = require('../database/connection')
// importa mercadoPagoClient
const { preference } = require('../utils/mercadoPago')

const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM producto', (error, results) => {
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
      'SELECT * FROM producto WHERE idProducto = ?',
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
    const { title, quantity, price, id } = req.body
    console.log('title', title)

    const preferenceBody = {
      items: [
        {
          title,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: 'COP',
        },
      ],
      back_urls: {
        success: process.env.FRONTEND_URL + '/product/' + id + '/success',
        failure: process.env.FRONTEND_URL + '/product/' + id + '/failure',
        pending: process.env.FRONTEND_URL + '/product/' + id + '/pending',
      },
      auto_return: 'approved',
    }
    console.log('preferenceBody', preferenceBody)
    const result = await preference.create({
      body: preferenceBody
    })

    res.status(200).json({
      success: true,
      message: 'Preferencia de MercadoPago creada exitosamente',
      preferenceId: result.id,
    })
  }
  catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    res.status(500).json({
      success: false,
      message: 'Error creando preferencia de MercadoPago',
      error: error.message,
    })
  }
}

module.exports = { getProducto, getProductById, createPreference }
