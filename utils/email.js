// Sets up a mail client to send confirmation codes
const nodemailer = require('nodemailer')

// Set mail sending parameters
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_ONLINE,
    pass: process.env.PASSWORD_ONLINE,
  },
})

module.exports = {
  emailTransporter,
}
