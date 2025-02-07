const getProducto = async (req, res) => {
  try {
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
    })
  }
}

module.exports = { getProducto }
