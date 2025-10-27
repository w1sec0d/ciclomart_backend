// Description: Main app file
// It configures the server and the API routes.
require('dotenv').config() // Load environment variables

// Import the necessary dependencies
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan') // Middleware to show the request logs

// Create the express application
const app = express()
app.use(bodyParser.json()) // Convert the request body to a JS object

// Only allow requests from the authorized frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, webhooks)
    if (!origin) return callback(null, true)

    // Allow requests from frontend
    if (origin === process.env.FRONTEND_INTERNAL_URL) {
      return callback(null, true)
    }

    // Reject other origins
    callback(new Error('Not allowed by CORS'))
  },
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Show the request logs in the console
morgan.token('requestBody', (request) => JSON.stringify(request.body))
app.use(morgan(' :method :url :response-time :requestBody'))

// Load the API routes
app.use('/api', require('./routes/routes'))

module.exports = app
