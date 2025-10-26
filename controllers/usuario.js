// Handles user related operations
const { executeQuery, findUserById, insert, updateById } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber, validateRequiredFields, isValidEmail } = require('../utils/validation')
const { extractBearerToken, verifyJwtToken } = require('../utils/authHelpers')
const bcrypt = require('bcrypt')

// Registers a new user
const registerUser = async (request, response) => {
  try {
    const { nombre, apellido, email, password, telefono } = request.body

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['nombre', 'apellido', 'email', 'password', 'telefono'])
    if (!validation.isValid) {
      return sendError(response, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return sendError(response, 'Invalid email format', 400)
    }

    // Hash password and insert user
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await insert('usuario', {
      nombre,
      apellido,
      correo: email,
      password: passwordHash,
      telefono,
      fechaRegistro: new Date()
    })

    return sendSuccess(response, 'User added successfully', { idUsuario: result.insertId }, 201)
  } catch (error) {
    return handleError(response, error, 'Error registering user')
  }
}

// Gets user's information received from the token
const getUser = async (request, response) => {
  try {
    // Extract and validate token
    const { token, error } = extractBearerToken(request)
    if (error) {
      return sendError(response, error, 401)
    }

    // Verify token
    const decoded = verifyJwtToken(token)

    // Find user
    const user = await findUserById(decoded.id)
    if (!user) {
      return sendError(response, 'User not found', 404)
    }

    return sendSuccess(response, 'User information retrieved successfully', { user })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(response, 'Token has expired', 401)
    }
    return handleError(response, error, 'Authentication error', 'Invalid token')
  }
}

// Gets a user's photo by their ID
const getUserPhoto = async (request, response) => {
  try {
    const { id } = request.params

    if (!isValidNumber(id)) {
      return sendError(response, 'Invalid user ID', 400)
    }

    const results = await executeQuery('SELECT url FROM imagen WHERE idUsuario = ?', [id])

    if (results.length === 0) {
      return sendError(response, 'Photo not found for the specified user', 404)
    }

    return sendSuccess(response, 'User photo retrieved successfully', { photoUrl: results[0].url })
  } catch (error) {
    return handleError(response, error, 'Error getting user photo')
  }
}

// Updates a user's photo
const updateUserPhoto = async (request, response) => {
  try {
    const { photoUrl } = request.body
    const { idUser } = request.params

    // Validate required fields
    const validation = validateRequiredFields(request.body, ['photoUrl'])
    if (!validation.isValid) {
      return sendError(response, 'No photo URL provided', 400)
    }

    if (!isValidNumber(idUser)) {
      return sendError(response, 'Invalid user ID', 400)
    }

    const query = `
      INSERT INTO imagen (idUsuario, url) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE url = VALUES(url)
    `
    await executeQuery(query, [idUser, photoUrl])

    return sendSuccess(response, 'User photo updated successfully')
  } catch (error) {
    return handleError(response, error, 'Error updating user photo')
  }
}

// Updates a user's address
const updateUserAddress = async (request, response) => {
  try {
    const { idUser } = request.params
    const addressData = request.body

    // Validate user ID
    if (!isValidNumber(idUser)) {
      return sendError(response, 'Invalid user ID', 400)
    }

    // Validate required fields
    const validation = validateRequiredFields(addressData, [
      'direccionNombre',
      'direccionNumero',
      'codigoPostal',
      'direccionCiudad'
    ])
    if (!validation.isValid) {
      return sendError(response, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Update address using helper
    await updateById('usuario', 'idUsuario', idUser, addressData)

    return sendSuccess(response, 'Address updated successfully', addressData)
  } catch (error) {
    return handleError(response, error, 'Error updating address')
  }
}

module.exports = {
  getUser,
  getUserPhoto,
  registerUser,
  updateUserPhoto,
  updateUserAddress,
}
