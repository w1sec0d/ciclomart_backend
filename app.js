require('dotenv').config() // Cargar las variables de entorno
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const database = require('./database/connection')

const app = express()
const port = process.env.DB_PORT

app.use(bodyParser.json())
app.use(cors())

// Middleware para registrar el cuerpo de la solicitud
morgan.token('requestBody', (request) => JSON.stringify(request.body))
app.use(morgan(' :method :url :response-time :requestBody'))

// Rutas
app.use('/api', require('./routes/routes'))

// TESTING A PULL REQUEST
module.exports = app
