const db = require('../database/connection');

const getQuestions = (request, response) => {

    const { idProducto } = request.params

    db.query('SELECT * FROM pregunta WHERE idProducto = ?', [idProducto], (error, results) => {
        if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
            success: false,
            message: 'Error en el servidor, intentalo más tarde',
            error: error.message,
        })
        }
        return response.status(200).json({
        success: true,
        message: 'Preguntas obtenidas con exito',
        results,
        })
    })
}

const addQuestion = (request, response) => {
    const { idProducto, idUsuario, pregunta } = request.body

    db.query('INSERT INTO pregunta (idProducto, idUsuario, descripcion) VALUES (?, ?, ?)', [idProducto, idUsuario, pregunta], (error, results) => {
        if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
            success: false,
            message: 'Error en el servidor, intentalo más tarde',
            error: error.message,
        })
        }
        return response.status(200).json({
        success: true,
        message: 'Pregunta agregada con exito',
        results,
        })
    })
}

module.exports = { getQuestions, addQuestion }
