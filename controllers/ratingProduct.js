const db = require('../database/connection');

const ratingProduct = (request, response) => {
    
    const { id } = request.params;
    const idProducto = parseInt(id);

    
    if (isNaN(idProducto)){
        return response.status(400).json({
            success: false,
            message: "ID producto inválido"
        })
    }

    db.query('SELECT * FROM VistaCalificacionesProducto WHERE idProducto = ?',[idProducto],
        (error, results) => {
            if(error){
                console.error('Error realizando la consulta ', error);
                return response.status(500).json({
                    success: false,
                    message: 'Error en el servidor, intentalo más tarde',
                    error: error.message
                })
            }

            return response.status(200).json({
                success: true,
                message: 'Calificaciones obtenidas con exito',
                results
            })
        }
    )
}

module.exports = {ratingProduct}