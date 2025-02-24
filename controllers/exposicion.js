const { preference } = require('../utils/mercadoPago')

const createExposurePreference = async (req, res) => {
  try {
    const { grade, price, quantity } = req.body

    const preferenceBody = {
      items: [
        {
          title: `Grade ${grade}`,
          unit_price: Number(price),
          quantity: Number(quantity),
          currency_id: 'COP',
        },
      ],
      back_urls: {
        success: process.env.FRONTEND_URL + '/requestResult/purchaseComplete',
        failure: process.env.FRONTEND_URL + '/requestResult/purchaseFailed',
        pending: process.env.FRONTEND_URL + '/requestResult/purchasePending',
      },
      auto_return: 'approved',
      notification_url: process.env.BACKEND_URL + '/webhookMercadoLibre',
    }
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
  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    res.status(500).json({
      success: false,
      message: 'Error creando preferencia de MercadoPago',
      error: error.message,
    })
  }
}

module.exports = {
  createExposurePreference,
}
