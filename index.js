require('dotenv').config()
const app = require('./app')
const appPort = process.env.PORT || 3001

app.listen(appPort, () => {
  console.log(`Server running on http://localhost:${appPort}`)
})
