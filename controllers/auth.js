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
const e = require('express')

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
    const language = req.body.language || 'es'

    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400)
    }

    const emailAvailable = await isEmailAvailable(email)
    if (emailAvailable) {
      return sendError(res, 'Email does not exist in the system', 401)
    }

    const token = createJwtToken({ correo: email }, '1h')
    await sendRecoverEmail(email, token, language)

    return sendSuccess(res, 'Recovery email sent successfully')
  } catch (err) {
    return handleError(res, err, 'Error sending recovery email')
  }
}

// Sends a verification code to complete registration
const sendRegisterCode = async (req, res) => {
  try {
    const language = req.body.language || 'es'

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

    await sendVerificationCode(email, token, code, language)

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
const sendRecoverEmail = async (email, token, language = 'es') => {
  if (language.toLowerCase().startsWith('en')) {
    await emailTransporter.sendMail({
      from: '"Ciclo Mart Support" <ciclomartsoporte@gmail.com>',
      to: email,
      subject: 'Password Recovery - CicloMart',
      text: `Hello, to reset your password, enter the following link: ${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🔑 Password Recovery
              </h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello! We received a request to reset your CicloMart account password.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}" 
                   style="display: inline-block; background-color: #e74c3c; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); transition: all 0.3s ease;">
                  Reset Password
                </a>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 40px 0 20px; color: #999999; font-size: 12px; line-height: 1.6;">
                This link will expire in 1 hour for security reasons. After clicking the button, you'll be able to set a new password.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}" 
                   style="color: #e74c3c; word-break: break-all; text-decoration: none;">
                  ${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}
                </a>
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} CicloMart. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } else {
    await emailTransporter.sendMail({
      from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
      to: email,
      subject: 'Recuperación de Contraseña - CicloMart',
      text: `¡Hola!, para restablecer tu contraseña, ingresa al siguiente enlace: ${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🔑 Recuperación de Contraseña
              </h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Hola! Recibimos una solicitud para restablecer la contraseña de tu cuenta en CicloMart.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Haz clic en el botón de abajo para crear una nueva contraseña:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}" 
                   style="display: inline-block; background-color: #e74c3c; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); transition: all 0.3s ease;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Aviso de Seguridad:</strong> Si no solicitaste este restablecimiento de contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.
                </p>
              </div>
              
              <p style="margin: 40px 0 20px; color: #999999; font-size: 12px; line-height: 1.6;">
                Este enlace expirará en 1 hora por razones de seguridad. Después de hacer clic en el botón, podrás establecer una nueva contraseña.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}" 
                   style="color: #e74c3c; word-break: break-all; text-decoration: none;">
                  ${process.env.FRONTEND_EXTERNAL_URL}/passwordRecovery/${token}
                </a>
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} CicloMart. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  }
}

// Sends the verification code to the user (to complete registration)
const sendVerificationCode = async (email, token, code, language) => {
  if (language.toLowerCase().startsWith('en')) {
    await emailTransporter.sendMail({
      from: '"Ciclo Mart Support" <ciclomartsoporte@gmail.com>',
      to: email,
      subject: 'Verification Code - CicloMart',
      text: `Hello, this is your verification code: ${code} You can enter the code in CicloMart or click here: ${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🔐 Verification Code
              </h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello! Thanks for joining CicloMart.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Enter this code to complete your registration:
              </p>
              
              <div style="background-color: #f8f9fa; border: 2px dashed #2ecc71; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <div style="display: inline-block; background-color: #ffffff; padding: 0 30px;">
                  <h2 style="margin: 0; color: #2ecc71; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </h2>
                </div>
              </div>
              
              <p style="margin: 30px 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Or click the button below to verify automatically:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}" 
                   style="display: inline-block; background-color: #2ecc71; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3); transition: all 0.3s ease;">
                  Verify Account
                </a>
              </div>
              
              <p style="margin: 40px 0 20px; color: #999999; font-size: 12px; line-height: 1.6;">
                This code will expire in 1 hour for security reasons. If you didn't request this code, please ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}" 
                   style="color: #2ecc71; word-break: break-all; text-decoration: none;">
                  ${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}
                </a>
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} CicloMart. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } else {
    await emailTransporter.sendMail({
      from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
      to: email,
      subject: 'Código de Verificación - CicloMart',
      text: `¡Hola!, este es tu código de verificación: ${code} Puedes ingresar el código en CicloMart o hacer click aquí: ${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🔐 Código de Verificación
              </h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Hola! Gracias por unirte a CicloMart.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Ingresa este código para completar tu registro:
              </p>
              
              <div style="background-color: #f8f9fa; border: 2px dashed #2ecc71; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <div style="display: inline-block; background-color: #ffffff; padding: 0 30px;">
                  <h2 style="margin: 0; color: #2ecc71; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </h2>
                </div>
              </div>
              
              <p style="margin: 30px 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                O haz clic en el botón de abajo para verificar automáticamente:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}" 
                   style="display: inline-block; background-color: #2ecc71; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3); transition: all 0.3s ease;">
                  Verificar Cuenta
                </a>
              </div>
              
              <p style="margin: 40px 0 20px; color: #999999; font-size: 12px; line-height: 1.6;">
                Este código expirará en 1 hora por razones de seguridad. Si no solicitaste este código, ignora este correo.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}" 
                   style="color: #2ecc71; word-break: break-all; text-decoration: none;">
                  ${process.env.FRONTEND_EXTERNAL_URL}/verificationCode/${token}?code=${code}
                </a>
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} CicloMart. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  }
}

module.exports = {
  login,
  sendRecover,
  updatePassword,
  sendRegisterCode,
  validateCode,
}
