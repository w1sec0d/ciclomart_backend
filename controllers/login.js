// This controller handles user authentication and password recovery operations

// Load environment variables and necessary modules
require('dotenv').config()
const db = require('../database/connection')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { emailTransporter } = require('../utils/email')
const generateVerificationCode = require('../utils/generateVerificationCode')

// Logs in the user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete credentials, verify your data',
      })
    }

    db.query(
      'SELECT * FROM usuario WHERE correo = ?',
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Server error, try again later',
            error: err.message,
          })
        }

        if (result.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect credentials, try again',
          })
        }

        const user = result[0]
        // Compare the password with the hashed password in the database
        const passwordUser = await bcrypt.compare(password, user.password)

        if (!passwordUser) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect credentials, try again',
          })
        }

        const userForToken = {
          id: user.idUsuario,
          correo: user.correo,
          username: user.username,
        }

        const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
          expiresIn: '1h',
        })

        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: result[0],
        })
      }
    )
  } catch (error) {
    handleError(res, error, 'Server error')
  }
}

// Verifies if the email exists in the database
const isEmailAvailable = async (email) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM usuario WHERE correo = ?',
        [email],
        (err, result) => {
          if (err) {
            return reject(err)
          }
          if (result.length === 0) {
            return resolve(true) // Correo no existe
          }
          resolve(false) // Correo existe
        }
      )
    })
    return result
  } catch (error) {
    console.error('Error verifying the email:', error)
    throw error
  }
}

// Sends an email to the user to recover their account
const sendRecover = async (req, res) => {
  try {
    const email = req.body.data
    const user = await isEmailAvailable(email)
    if (!user) {
      const userForToken = { correo: email }
      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '1h',
      })
      await sendRecoverEmail(email, token)
      return res.status(200).json({
        success: true,
        message: 'Se ha enviado un correo de verificación a tu correo',
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'El correo no existe en el sistema, verifícalo de nuevo',
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error, intentalo más tarde',
      error: err.message,
    })
  }
}

// Sends a verification code to complete registration
const sendRegisterCode = async (req, res) => {
  try {
    const { email, nombre, apellido, password, telefono } = req.body.data
    if (!req.body.data) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos de registro, intentalo de nuevo',
      })
    }

    const code = generateVerificationCode()

    const userForToken = {
      correo: email,
      nombre,
      apellido,
      password,
      telefono,
      code,
    }
    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    const validEmail = await isEmailAvailable(email)

    if (!validEmail) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya se encuentra registrado',
      })
    }

    await sendVerificationCode(email, token, code)
    return res.status(200).json({
      success: true,
      message: 'Codigo de confirmación enviado con éxito',
      email,
      token,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error, intentalo más tarde',
      error: error.message,
    })
  }
}

// Validates if the code entered by the user matches the code stored in the token
const validateCode = async (req, res) => {
  try {
    const codigo = parseInt(req.body.data.code)
    const token = req.body.token

    const decoded = verifyToken(token)
    const { correo, nombre, apellido, password, telefono, code } = decoded

    if (codigo === code) {
      return res.status(200).json({
        success: true,
        message: 'Código validado correctamente',
        correo,
        nombre,
        telefono,
        apellido,
        password,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Codigo no congruente! Intentalo de nuevo',
      })
    }
  } catch (error) {
    handleError(res, error, 'Server error')
  }
}

// Verifies the token for password reset
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('!El token del usuario ha vencido')
    } else {
      console.error('Verificacion de token fallida:', error)
    }
    throw error
  }
}

// Updates the user's password
const updatePassword = async (req, res) => {
  try {
    const { data, token } = req.body

    const decoded = verifyToken(token)
    const hashedPassword = await bcrypt.hash(data, 10)

    db.query(
      'UPDATE usuario SET password = ? WHERE correo = ?',
      [hashedPassword, decoded.correo],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Server error, try again later',
            error: err.message,
          })
        } else {
          return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
          })
        }
      }
    )
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message,
    })
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
  verifyToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
}
