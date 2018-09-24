const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const merchant_controller  = require("./../../controllers/merchant/index");

// Get user details
router.post("/fetch_user",  merchant_controller.fetch_user);

// Perform A charge operation
router.post("/charge_user",  merchant_controller.charge_user);

module.exports = router;