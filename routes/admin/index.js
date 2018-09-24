const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_controller  = require("./../../controllers/admin/admin");
const admin_db          = require("./../../database/models/admin");

// Perform login to retrieve login token
router.post("/login",  admin_controller.login);

// Add the check in location Route
router.use("/check_in_location", auth_function.admin_login, require("./check_in"));

// Add the merchant Route
router.use("/merchant", auth_function.admin_login, require("./merchant"));

// Add the user Route
router.use("/user", auth_function.admin_login, require("./user"));

module.exports = router;