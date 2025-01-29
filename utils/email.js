const nodemailer = require('nodemailer')

// Define los parámetros del envío de correo
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ONLINE,
    pass: process.env.PASSWORD_ONLINE,
  },
})

module.exports = {
  emailTransporter,
}
