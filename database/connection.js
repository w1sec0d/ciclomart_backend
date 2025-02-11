//Coneccion a la base de datos usando variables de entorno
require('dotenv').config()
const mysql = require('mysql2/promise')

// Crea un pool de conexiones a la base de datos
const db = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones en el pool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

// Test de conexión
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos', err)
    return
  }
  console.log('Conectado a la base de datos')
  connection.release() // Liberar la conexión de vuelta al pool
})

module.exports = db
