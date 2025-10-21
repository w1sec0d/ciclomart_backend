// Script para debugging de pagos de Mercado Pago
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago')
const { executeQuery } = require('../utils/dbHelpers')
require('dotenv').config()

const debugPayment = async (req, res) => {
    try {
        const { preferenceId } = req.query

        if (!preferenceId) {
            return res.status(400).json({
                error: 'Missing preferenceId',
                usage: '/api/debug/payment?preferenceId=XXX',
                example: '/api/debug/payment?preferenceId=2290219996-62589a60-5112-4337-88c5-74c4d2f29ca6'
            })
        }

        console.log('=== DEBUGGING PAYMENT BY PREFERENCE ===')
        console.log('Preference ID:', preferenceId)

        // Extraer collector_id del preference_id
        const collectorId = preferenceId.split('-')[0]
        console.log('Collector ID:', collectorId)

        // Buscar vendedor con ese collector_id en la base de datos
        const vendedores = await executeQuery(
            'SELECT idUsuario, nombre, apellido, correo, mp_user_id, mp_access_token FROM usuario WHERE mp_user_id = ?',
            [collectorId]
        )

        if (!vendedores || vendedores.length === 0) {
            return res.status(404).json({
                error: 'No seller found with this collector_id',
                collectorId,
                tip: 'This seller may not have completed OAuth'
            })
        }

        const vendedor = vendedores[0]
        console.log('Seller found:', vendedor.nombre, vendedor.apellido)

        // Configurar cliente con el access token del vendedor
        const client = new MercadoPagoConfig({
            accessToken: vendedor.mp_access_token
        })

        const preferenceClient = new Preference(client)
        const paymentClient = new Payment(client)

        // Obtener detalles de la preferencia
        let preferenceDetails
        try {
            preferenceDetails = await preferenceClient.get({ preferenceId })
            console.log('\n=== PREFERENCE DETAILS ===')
            console.log('Status:', preferenceDetails.status || 'active')
            console.log('Collector ID:', preferenceDetails.collector_id)
            console.log('Marketplace:', preferenceDetails.marketplace)
            console.log('Marketplace Fee:', preferenceDetails.marketplace_fee)
            console.log('External Reference:', preferenceDetails.external_reference)
        } catch (error) {
            console.error('Error getting preference:', error.message)
            preferenceDetails = { error: error.message }
        }

        // Buscar pagos asociados a esta preferencia
        let payments = []
        try {
            const paymentSearchResult = await paymentClient.search({
                options: {
                    criteria: 'desc',
                    external_reference: preferenceDetails.external_reference,
                    limit: 10
                }
            })
            payments = paymentSearchResult.results || []
            console.log('\n=== PAYMENTS FOUND ===')
            console.log('Total payments:', payments.length)

            payments.forEach((payment, index) => {
                console.log(`\nPayment ${index + 1}:`)
                console.log('  ID:', payment.id)
                console.log('  Status:', payment.status)
                console.log('  Status Detail:', payment.status_detail)
                console.log('  Amount:', payment.transaction_amount)
                console.log('  Payment Method:', payment.payment_method_id)
                console.log('  Date:', payment.date_created)
            })
        } catch (error) {
            console.error('Error searching payments:', error.message)
        }

        // Buscar en la base de datos local
        const cartItems = await executeQuery(
            'SELECT * FROM carrito WHERE idPreferencia = ? OR external_reference = ?',
            [preferenceId, preferenceDetails.external_reference]
        )

        return res.json({
            success: true,
            seller: {
                id: vendedor.idUsuario,
                name: `${vendedor.nombre} ${vendedor.apellido}`,
                email: vendedor.correo,
                mp_user_id: vendedor.mp_user_id
            },
            preference: {
                id: preferenceId,
                collector_id: collectorId,
                details: preferenceDetails,
                excluded_payment_methods: preferenceDetails.payment_methods?.excluded_payment_methods,
                excluded_payment_types: preferenceDetails.payment_methods?.excluded_payment_types
            },
            payments: payments.map(p => ({
                id: p.id,
                status: p.status,
                status_detail: p.status_detail,
                amount: p.transaction_amount,
                payment_method: p.payment_method_id,
                date: p.date_created,
                error_message: p.error_message
            })),
            localCart: cartItems,
            diagnosis: {
                hasExcludedPaymentMethods: preferenceDetails.payment_methods?.excluded_payment_methods?.length > 0,
                excludedPaymentMethodsValue: preferenceDetails.payment_methods?.excluded_payment_methods,
                hasExcludedPaymentTypes: preferenceDetails.payment_methods?.excluded_payment_types?.length > 0,
                excludedPaymentTypesValue: preferenceDetails.payment_methods?.excluded_payment_types,
                paymentsAttempted: payments.length,
                lastPaymentStatus: payments[0]?.status || 'none',
                lastPaymentError: payments[0]?.status_detail || 'none'
            }
        })
    } catch (error) {
        console.error('Error debugging payment:', error)
        return res.status(500).json({
            error: error.message,
            details: error.cause,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}

module.exports = { debugPayment }


