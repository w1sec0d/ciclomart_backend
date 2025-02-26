// Objetos de configuración de MercadoPago
const { MercadoPagoConfig, Preference } = require('mercadopago')

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

const preference = new Preference(mercadoPagoClient)

module.exports = { mercadoPagoClient, preference }
