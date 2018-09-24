const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_controller  = require("./../../controllers/admin/admin");

// Create check in location
router.post("/",  admin_controller.check_in_location);

// Get All check in location
router.get("/",  admin_controller.get_locations);

// Delete a check in location
router.delete("/:location_Id", admin_controller.delete_location);

module.exports = router;