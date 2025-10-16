// This controller handles OAuth authentication with Mercado Pago for seller registration
const axios = require('axios')
const db = require('../database/connection')
require('dotenv').config()

// Handles the OAuth callback from Mercado Pago and registers the user with seller credentials
const oauthCallback = async (req, res) => {
  const { code, state } = req.query
  try {
    // Decode the state to obtain the randomId and user ID
    const [randomId, idUsuario] = decodeURIComponent(state).split(',')

    const oauthBody = {
      client_secret: process.env.MP_CLIENT_SECRET,
      client_id: process.env.MP_CLIENT_ID,
      code: code,
      redirect_uri: process.env.MP_REDIRECT_URL,
      test_token: true,
      grant_type: 'authorization_code',
    }
    // Send the request to MercadoPago API using axios
    const oauthResponse = await axios.post(
      'https://api.mercadopago.com/oauth/token',
      oauthBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // Save the tokens and user_id in the database
    const { access_token, public_key, refresh_token, user_id } =
      oauthResponse.data

    // TODO: the mp_public_key is the same for all users, so that field should be removed from the database  
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE usuario SET mp_access_token = ?, mp_refresh_token = ?, mp_user_id = ?, mp_public_key = ?, rol = "vendedor" WHERE idUsuario = ?',
        [access_token, refresh_token, user_id, public_key, idUsuario],
        (error, results) => {
          if (error) {
            console.error('Error updating user', error)
            return reject(error)
          }
          resolve(results)
        }
      )
    })
    const frontendURL = process.env.FRONTEND_EXTERNAL_URL
    // Redirect to the notification page
    return res.redirect(
      frontendURL + '/requestResult/sellerRegistrationSuccess'
    )
  } catch (error) {
    console.error('Error obtaining access_token', error)
    res
      .status(500)
      .json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
  }
}

module.exports = {
  oauthCallback,
}
