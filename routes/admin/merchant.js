const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_controller  = require("./../../controllers/admin/admin");

// Create Merchant
router.post("/",  admin_controller.merchant);

// Get All merchant
router.get("/", admin_controller.get_merchants);

// Delete a merchant
router.delete("/:merchant_Id", admin_controller.delete_merchant);

module.exports = router;