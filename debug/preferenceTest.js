const { preference } = require('../utils/mercadoPago');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const preferenceTest = async (req, res) => {
    try {
        const preferenceResult = await preference.create({
            body: {
                items: [
                    {
                        title: 'Mi producto',
                        quantity: 1,
                        unit_price: 2000
                    }
                ],
                auto_return: 'approved',
                back_urls: {
                    success: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchaseComplete',
                    failure: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchaseFailed',
                    pending: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchasePending',
                },
            }
        })
        console.log('preferenceResult', preferenceResult)
        return sendSuccess(res, 'Preference created successfully', preferenceResult)
    } catch (error) {
        console.error('Error creating preference', error)
        return sendError(res, 'Error creating preference', error)
    }
}

module.exports = { preferenceTest }
