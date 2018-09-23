const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_controller  = require("./../../controllers/admin/admin");
const admin_db          = require("./../../database/models/admin");

// Post to login
router.post("/login",  admin_controller.login);

// Create check in location
router.post("/check_in_location", auth_function.admin_login, admin_controller.check_in_location);

// Get All check in location
router.get("/check_in_location", auth_function.admin_login, admin_controller.get_locations);

// Delete a check in location
router.delete("/check_in_location/:location_Id", auth_function.admin_login, admin_controller.delete_location);

// Create Merchant
router.post("/merchant", auth_function.admin_login, admin_controller.merchant);

// Get All merchant
router.get("/merchant", auth_function.admin_login, admin_controller.get_merchants);

// Delete a merchant
router.delete("/merchant/:merchant_Id", auth_function.admin_login, admin_controller.delete_merchant);

module.exports = router;