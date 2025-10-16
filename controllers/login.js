// This controller handles user authentication and password recovery operations

// Load environment variables and necessary modules
require('dotenv').config()
const { executeQuery, findUserByEmail } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { validateRequiredFields, isValidEmail } = require('../utils/validation')
const { verifyJwtToken, createJwtToken } = require('../utils/authHelpers')
const bcrypt = require('bcrypt')
const { emailTransporter } = require('../utils/email')
const generateVerificationCode = require('../utils/generateVerificationCode')

// Logs in the user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['email', 'password'])
    if (!validation.isValid) {
      return sendError(res, 'Incomplete credentials, verify your data', 400)
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400)
    }

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user) {
      return sendError(res, 'Incorrect credentials, try again', 401)
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return sendError(res, 'Incorrect credentials, try again', 401)
    }

    // Create JWT token
    const token = createJwtToken({
      id: user.idUsuario,
      correo: user.correo,
      username: user.username,
    }, '1h')

    return sendSuccess(res, 'Login successful', { token, user })
  } catch (error) {
    return handleError(res, error, 'Error during login')
  }
}

// Verifies if the email exists in the database
const isEmailAvailable = async (email) => {
  try {
    const user = await findUserByEmail(email)
    return !user // Returns true if email is available (user not found)
  } catch (error) {
    console.error('Error verifying the email:', error)
    throw error
  }
}

// Sends an email to the user to recover their account
const sendRecover = async (req, res) => {
  try {
    const email = req.body.data

    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400)
    }

    const emailAvailable = await isEmailAvailable(email)
    if (emailAvailable) {
      return sendError(res, 'Email does not exist in the system', 401)
    }

    const token = createJwtToken({ correo: email }, '1h')
    await sendRecoverEmail(email, token)

    return sendSuccess(res, 'Recovery email sent successfully')
  } catch (err) {
    return handleError(res, err, 'Error sending recovery email')
  }
}

// Sends a verification code to complete registration
const sendRegisterCode = async (req, res) => {
  try {
    if (!req.body.data) {
      return sendError(res, 'Registration data missing', 400)
    }

    const { email, nombre, apellido, password, telefono } = req.body.data

    // Validate required fields
    const validation = validateRequiredFields(req.body.data, ['email', 'nombre', 'apellido', 'password', 'telefono'])
    if (!validation.isValid) {
      return sendError(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400)
    }

    // Check if email is available
    const emailAvailable = await isEmailAvailable(email)
    if (!emailAvailable) {
      return sendError(res, 'Email already registered', 400)
    }

    const code = generateVerificationCode()

    const token = createJwtToken({
      correo: email,
      nombre,
      apellido,
      password,
      telefono,
      code,
    }, '1h')

    await sendVerificationCode(email, token, code)

    return sendSuccess(res, 'Verification code sent successfully', { email, token })
  } catch (error) {
    return handleError(res, error, 'Error sending verification code')
  }
}

// Validates if the code entered by the user matches the code stored in the token
const validateCode = async (req, res) => {
  try {
    const codigo = parseInt(req.body.data.code)
    const token = req.body.token

    const decoded = verifyJwtToken(token)
    const { correo, nombre, apellido, password, telefono, code } = decoded

    if (codigo === code) {
      return sendSuccess(res, 'Code validated successfully', {
        correo,
        nombre,
        telefono,
        apellido,
        password,
      })
    } else {
      return sendError(res, 'Code does not match! Try again', 400)
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Code has expired', 401)
    }
    return handleError(res, error, 'Error validating code', 'Invalid code')
  }
}

// Updates the user's password
const updatePassword = async (req, res) => {
  try {
    const { data, token } = req.body

    if (!data || !token) {
      return sendError(res, 'Password and token are required', 400)
    }

    const decoded = verifyJwtToken(token)
    const hashedPassword = await bcrypt.hash(data, 10)

    await executeQuery(
      'UPDATE usuario SET password = ? WHERE correo = ?',
      [hashedPassword, decoded.correo]
    )

    return sendSuccess(res, 'Password updated successfully')
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired', 401)
    }
    return handleError(res, err, 'Error updating password', 'Invalid or expired token')
  }
}

// Sends the recovery email to the user (password recovery)
const sendRecoverEmail = async (email, token) => {
  await emailTransporter.sendMail({
    from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Recuperación de contraseña',
    text: `¡Hola!, para restablecer tu contraseña, ingresa al siguiente enlace: ${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}`,
    html: `<b>Hola, para restablecer tu contraseña, ingresa al siguiente enlace: <a href="${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}">Restablecer Contraseña</a></b>`,
  })
}

// Sends the verification code to the user (to complete registration)
const sendVerificationCode = async (email, token, code) => {
  await emailTransporter.sendMail({
    from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Código CicloMart',
    text: `¡Hola!, este es tu código de verificación: ${code} Puedes ingresar el código en CicloMart o hacer click aquí: ${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}`,
    html: `¡Hola!, este es tu código de verificación: <b>${code}</b> Puedes ingresar el código en CicloMart o hacer click aquí: <a href="${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}">Da click aquí</a>`,
  })
}

module.exports = {
  login,
  sendRecover,
  updatePassword,
  sendRegisterCode,
  validateCode,
}
