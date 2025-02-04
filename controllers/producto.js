const db = require('../database/connection')

const getProducto = async (req, res) => {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
    })
  }
}

module.exports = { getProducto }
