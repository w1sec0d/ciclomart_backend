const db = require('../database/connection')

const getPurchasesById = async (req, res) => {
    const { idComprador } = req.params
    if (!idComprador) return res.status(400).json({ success: false, message: 'Falta el id del comprador' })

    try {
        db.query('SELECT * FROM vista_compras_usuario WHERE idUsuario = ?', [idComprador], (error, results) => {
            if (error) {
                console.error('Error ejecutando la consulta', error)
                return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message })
            }
            return res.status(200).json({
                success: true, message: 'Compras obtenidas exitosamente', results
            })
        }
        )
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las compras' })
    }
}

const confirmShipment = async (req, res) => {
    const { idCarrito } = req.params
    if (!idCarrito) return res.status(400).json({ success: false, message: 'Falta el id del carrito' })

    try {
        db.query('UPDATE carrito SET estado = "Enviado" WHERE idCarrito = ?', [idCarrito], (error, results) => {
            if (error) {
                console.error('Error ejecutando la consulta', error)
                return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message })
            }
            return res.status(200).json({
                success: true, message: 'Compra confirmada exitosamente'
            })
        }
        )
    } catch (error) {
        res.status(500).json({ message: 'Error al confirmar la compra' })
    }
}

const cancelPurchase = async (req, res) => {
    const { idCarrito } = req.params
    if (!idCarrito) return res.status(400).json({ success: false, message: 'Falta el id del carrito' })

    try {
        db.query('UPDATE carrito SET estado = "fallido" WHERE idCarrito = ?', [idCarrito], (error, results) => {
            if (error) {
                console.error('Error ejecutando la consulta', error)
                return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message })
            }
            return res.status(200).json({
                success: true, message: 'Compra cancelada exitosamente'
            })
        }
        )
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar la compra' })
    }
}

module.exports = {
    getPurchasesById,
    cancelPurchase,
    confirmShipment
}