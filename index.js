// Punto de entrada de la aplicación
require('dotenv').config()
const app = require('./app')
const appPort = process.env.PORT || 3001

// Inicia el servidor cargando el archivo app.js
app.listen(appPort, () => {
  console.log(`Servidor ejecutándose en: http://localhost:${appPort}`)
})
