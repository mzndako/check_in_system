const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const user_controller  = require("./../../controllers/user/index");

// Perform login to retrieve login token
router.post("/login",  user_controller.login);

// Get User Account Details
router.get("/account", auth_function.user_login, user_controller.get_account);

// Update user account details: first name and last name
router.put("/account", auth_function.user_login, user_controller.update_account);

// Change user PIN
router.put("/account/change_pin", auth_function.user_login, user_controller.change_pin);

// Fetch travelling reward log
router.get("/logs", auth_function.user_login, user_controller.logs);

module.exports = router;