// Genera un código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000)
}

export default generateVerificationCode
