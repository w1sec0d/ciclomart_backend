// This controller handles product questions and answers
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber, validateRequiredFields } = require('../utils/validation')

// Gets all questions for a specific product
const getQuestions = async (request, response) => {
  try {
    const { idProducto } = request.params

    if (!isValidNumber(idProducto)) {
      return sendError(response, 'Invalid product ID', 400)
    }

    const results = await executeQuery('SELECT * FROM pregunta WHERE idProducto = ?', [idProducto])
    return sendSuccess(response, 'Questions obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error getting questions')
  }
}

// Adds a new question to a product
const addQuestion = async (request, response) => {
  try {
    const { idProducto, idUsuario, pregunta } = request.body

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['idProducto', 'idUsuario', 'pregunta'])
    if (!validation.isValid) {
      return sendError(
        response,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      )
    }

    const results = await executeQuery(
      'INSERT INTO pregunta (idProducto, idUsuario, descripcion) VALUES (?, ?, ?)',
      [idProducto, idUsuario, pregunta]
    )

    return sendSuccess(response, 'Question added successfully', results, 201)
  } catch (error) {
    return handleError(response, error, 'Error adding question')
  }
}

// Adds an answer to a question for a product
const answerQuestions = async (request, response) => {
  try {
    const { idPregunta, idProducto, respuesta } = request.body

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['idPregunta', 'idProducto', 'respuesta'])
    if (!validation.isValid) {
      return sendError(
        response,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      )
    }

    const results = await executeQuery(
      'UPDATE pregunta SET respuesta = ? WHERE idProducto = ? AND idPregunta = ?',
      [respuesta, idProducto, idPregunta]
    )

    return sendSuccess(response, 'Question answered successfully', results)
  } catch (error) {
    return handleError(response, error, 'Error answering question')
  }
}

module.exports = { getQuestions, addQuestion, answerQuestions }