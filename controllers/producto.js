const db = require('../database/connection')

const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM producto', (error, results) => {
      if (error) {
        console.error('Error obteniendo productos:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo productos',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
    })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
      })
    }

    db.query(
      'SELECT * FROM producto WHERE idProducto = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error obteniendo producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo producto',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Producto obtenido exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: error.message,
    })
  }
}

module.exports = { getProducto, getProductById }
