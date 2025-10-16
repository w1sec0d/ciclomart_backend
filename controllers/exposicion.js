// This controller handles product exposure payment preferences through Mercado Pago
const { preference } = require('../utils/mercadoPago')
const { handleError } = require('../utils/responseHandler')

// Creates a payment preference for product exposure upgrade
const createExposurePreference = async (req, res) => {
  try {
    const { grade, price, quantity, idProducto } = req.body

    const externalReference = `exposicion-${idProducto}-${grade}`
    const preferenceBody = {
      items: [
        {
          title: `Exposure grade ${grade}`,
          category_id: 'exposicion',
          unit_price: Number(price),
          quantity: Number(quantity),
          currency_id: 'COP',
        },
      ],
      back_urls: {
        success: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/publishSuccess',
        failure: `${process.env.FRONTEND_EXTERNAL_URL}/exposure/${idProducto}?failure=true`,
        pending: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchasePending',
      },
      auto_return: 'approved',
      notification_url: process.env.BACKEND_URL + '/webhookMercadoLibre',
      external_reference: externalReference,
    }
    const result = await preference.create({
      body: preferenceBody,
    })

    return res.status(200).json({
      success: true,
      message: 'MercadoPago preference created successfully',
      preferenceId: result.id,
      paymentURL: result.init_point,
      result,
    })
  } catch (error) {
    handleError(res, error, 'Error creating MercadoPago preference')
  }
}

module.exports = {
  createExposurePreference,
}
