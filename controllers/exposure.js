// This controller handles product exposure payment preferences through Mercado Pago
const { preference } = require('../utils/mercadoPago')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { validateRequiredFields, isValidNumber } = require('../utils/validation')

// Creates a payment preference for product exposure upgrade
const createExposurePreference = async (req, res) => {
  try {
    const { grade, price, quantity, idProducto } = req.body

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['grade', 'price', 'quantity', 'idProducto'])
    if (!validation.isValid) {
      return sendError(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Validate IDs and numbers
    if (!isValidNumber(idProducto) || !isValidNumber(price) || !isValidNumber(quantity)) {
      return sendError(res, 'Invalid product ID, price, or quantity', 400)
    }

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

    return sendSuccess(res, 'MercadoPago preference created successfully', {
      preferenceId: result.id,
      paymentURL: result.init_point,
      result,
    })
  } catch (error) {
    return handleError(res, error, 'Error creating exposure preference')
  }
}

module.exports = {
  createExposurePreference,
}
