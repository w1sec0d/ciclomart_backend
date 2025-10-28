//Connection to the database using environment variables
require('dotenv').config()
const mysql = require('mysql2')

// Create a pool of connections to the database
const db = mysql.createPool({
  connectionLimit: 10, // Maximum number of connections in the pool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database', err)
    return
  }
  console.log('Connected to the database')
  connection.release() // Release the connection back to the pool
})

// TODO: Add new spare parts and diversify current bikes
module.exports = db