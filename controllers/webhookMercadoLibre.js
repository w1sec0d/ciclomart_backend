const webhookMercadoLibre = async (req, res) => {
    try {
        const { body } = req
        console.log('Webhook de Mercado Libre:', body)
        res.status(200).json({ success: true, message: 'Webhook recibido', body })
    } catch (error) {
        console.error('Error en el servidor', error)
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        })
    }
}

module.exports = webhookMercadoLibre;