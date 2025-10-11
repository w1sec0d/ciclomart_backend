// Description: Archivo principal de la aplicación.
// Se encarga de configurar el servidor y las rutas de la API.
require('dotenv').config() // Cargar las variables de entorno

// Importar las dependencias necesarias
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan') // Middleware para mostrar los logs de las solicitudes

// Crear la aplicación de express
const app = express()
app.use(bodyParser.json()) // Convierte el cuerpo de la solicitud a objeto JS

// Permite solicitudes al api únicamente desde el frontend autorizado
const corsOptions = {
  origin: process.env.FRONTEND_INTERNAL_URL,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Muestra los logs de las solicitudes en la consola
morgan.token('requestBody', (request) => JSON.stringify(request.body))
app.use(morgan(' :method :url :response-time :requestBody'))

// Cargar las rutas de la API
app.use('/api', require('./routes/routes'))

module.exports = app
