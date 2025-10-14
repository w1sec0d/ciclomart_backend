// Entry point of the application
require('dotenv').config()
const app = require('./app')
const appPort = process.env.PORT || 3001

// Start the server loading the app.js file
app.listen(appPort, () => {
  console.log(`Server running on: http://localhost:${appPort}`)
})
