module.exports = {
    // Setup port
    port: process.env.PORT || 9000,

    // Setup the secret keys for jwt
    jwt_secret_key_admin: process.env.SECRET_KEY_ADMIN || "kdsj4e323iko45589oijfdsnkljmld",
    jwt_secret_key_user: process.env.SECRET_KEY_USER || "dkasf23sdafjoisdajfiosajdfoj",
    jwt_secret_key_location: process.env.SECRET_KEY_LOCATION || "3232k32ljaskdjf94-43snkljmld",

    // Config the Default login details
    default_admin_email: process.env.ADMIN_EMAIL || "admin@admin.com",
    default_admin_username: "admin",
    default_admin_password: "admin",

    // Config other location parameters
    points_to_a_dollar: 10,
    points_per_km: 5,
    percentage_increase: 10,
    km_increase: 10,
    currency: "$"
}