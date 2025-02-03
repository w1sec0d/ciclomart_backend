
const db = require('../database/connection');

// Obtiene todas las calificaciones de un producto
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

//Calcula el promedio de las calificaciones de un producto

const averageProductRatings = (request, response) => {

    const {id} = request.params;
    const idProducto = parseInt(id);

    db.query('SELECT AVG(cal.nota) AS avg_calificacion FROM calificacion cal JOIN documentoproducto dp ON cal.idDocumentoProducto = dp.idDocumentoProducto WHERE dp.idProducto = ?',[idProducto],
        (error, results) => {
            if(error){
                console.error('Error realizando la consulta ', error);
                return response.status(500).json({
                    success: false,
                    message: 'Error en el servidor. Intentelo más tarde',
                    error: error.message
                })
            }
            return response.status(200).json({
                success: true,
                message: 'Promedio de la calificación obtenida con éxito',
                results
            })
        }
    )

}

module.exports = {
    ratingProduct,
    averageProductRatings
}