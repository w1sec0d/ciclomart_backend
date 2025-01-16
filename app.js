require('dotenv').config() // Cargar las variables de entorno
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const database = require('./database/connection')

const app = express()
const port = process.env.DB_PORT

app.use(bodyParser.json())
// Configure CORS to allow requests from the frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200, // For legacy browser support
}
app.use(cors(corsOptions))

// Middleware para registrar el cuerpo de la solicitud
morgan.token('requestBody', (request) => JSON.stringify(request.body))
app.use(morgan(' :method :url :response-time :requestBody'))

// Rutas
app.use('/api', require('./routes/routes'))

module.exports = app
