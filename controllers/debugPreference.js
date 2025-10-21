// Script para debugging de preferencias de Mercado Pago
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago')
require('dotenv').config()

const debugPreference = async (req, res) => {
    try {
        const { preferenceId, accessToken } = req.query

        if (!preferenceId || !accessToken) {
            return res.status(400).json({
                error: 'Missing preferenceId or accessToken',
                usage: '/api/debug/preference?preferenceId=XXX&accessToken=YYY'
            })
        }

        console.log('=== DEBUGGING PREFERENCE ===')
        console.log('Preference ID:', preferenceId)
        console.log('Access Token (first 20 chars):', accessToken.substring(0, 20))

        // Configurar cliente con el access token del vendedor
        const client = new MercadoPagoConfig({ accessToken })
        const preference = new Preference(client)

        // Obtener detalles de la preferencia
        const preferenceDetails = await preference.get({ preferenceId })

        console.log('\n=== PREFERENCE DETAILS ===')
        console.log(JSON.stringify(preferenceDetails, null, 2))

        return res.json({
            success: true,
            preferenceDetails,
            analysis: {
                collector_id: preferenceDetails.collector_id,
                marketplace: preferenceDetails.marketplace,
                marketplace_fee: preferenceDetails.marketplace_fee,
                excluded_payment_methods: preferenceDetails.payment_methods?.excluded_payment_methods,
                excluded_payment_types: preferenceDetails.payment_methods?.excluded_payment_types,
                items: preferenceDetails.items,
                payer: preferenceDetails.payer,
                status: preferenceDetails.status || 'active'
            }
        })
    } catch (error) {
        console.error('Error debugging preference:', error)
        return res.status(500).json({
            error: error.message,
            details: error.cause,
            stack: error.stack
        })
    }
}

module.exports = { debugPreference }

