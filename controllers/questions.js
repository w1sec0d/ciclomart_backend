// This controller handles product questions and answers
const db = require('../database/connection')

// Gets all questions for a specific product
const getQuestions = (request, response) => {
  const { idProducto } = request.params

  db.query(
    'SELECT * FROM pregunta WHERE idProducto = ?',
    [idProducto],
    (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Server error, try again later',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Questions obtained successfully',
        results,
      })
    }
  )
}

// Adds a new question to a product
const addQuestion = (request, response) => {
  const { idProducto, idUsuario, pregunta } = request.body

  db.query(
    'INSERT INTO pregunta (idProducto, idUsuario, descripcion) VALUES (?, ?, ?)',
    [idProducto, idUsuario, pregunta],
    (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Server error, try again later',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Question added successfully',
        results,
      })
    }
  )
}

// Adds an answer to a question for a product
const answerQuestions = (request, response) => {
  const { idPregunta, idProducto, respuesta } = request.body

  db.query(
    'UPDATE pregunta SET respuesta = ? WHERE idProducto = ? AND idPregunta = ?',
    [respuesta, idProducto, idPregunta],
    (error, results) => {
      if (error) {
        console.error('Error executing the query', error)
        return response.status(500).json({
          success: false,
          message: 'Server error, try again later',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Question answered successfully',
        results,
      })
    }
  )
}

module.exports = { getQuestions, addQuestion, answerQuestions }
