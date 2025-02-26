const oauthCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://api.mercadopago.com/oauth/token', {
            client_id: process.env.MP_CLIENT_ID,
            client_secret: process.env.MP_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://your-backend-url.com/oauth/callback',
        });

        const { access_token, public_key, refresh_token, user_id } = response.data;

        // Guarda los tokens y el user_id en tu base de datos
        await db.query('INSERT INTO vendedores (user_id, access_token, public_key, refresh_token) VALUES (?, ?, ?, ?)', [user_id, access_token, public_key, refresh_token]);

        res.status(200).json({ success: true, message: 'Vendedor conectado exitosamente' });
    } catch (error) {
        console.error('Error obteniendo el access_token', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
}

module.exports = {
    oauthCallback
}