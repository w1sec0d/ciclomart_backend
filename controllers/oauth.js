// This controller handles OAuth authentication with Mercado Pago for seller registration
const axios = require('axios')
const { updateById } = require('../utils/dbHelpers')
const { sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber } = require('../utils/validation')
require('dotenv').config()

// Handles the OAuth callback from Mercado Pago and registers the user with seller credentials
const oauthCallback = async (req, res) => {
  try {
    const { code, state } = req.query

    if (!code || !state) {
      return sendError(res, 'Missing OAuth code or state', 400)
    }

    // Decode the state to obtain the randomId and user ID
    const [randomId, idUsuario] = decodeURIComponent(state).split(',')

    if (!isValidNumber(idUsuario)) {
      return sendError(res, 'Invalid user ID', 400)
    }

    console.log('oauthBody', oauthBody)
    const oauthBody = {
      client_secret: process.env.MP_CLIENT_SECRET,
      client_id: process.env.MP_CLIENT_ID,
      code: code,
      redirect_uri: process.env.MP_REDIRECT_URL,
      grant_type: 'authorization_code',
      test_token: true,
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
    const { access_token, public_key, refresh_token, user_id } = oauthResponse.data

    await updateById('usuario', 'idUsuario', idUsuario, {
      mp_access_token: access_token,
      mp_refresh_token: refresh_token,
      mp_user_id: user_id,
      mp_public_key: public_key,
      rol: 'vendedor'
    })

    const frontendURL = process.env.FRONTEND_EXTERNAL_URL
    // Redirect to the notification page
    return res.redirect(frontendURL + '/requestResult/sellerRegistrationSuccess')
  } catch (error) {
    return handleError(res, error, 'Error during OAuth callback', 'Failed to complete seller registration')
  }
}

module.exports = {
  oauthCallback,
}
