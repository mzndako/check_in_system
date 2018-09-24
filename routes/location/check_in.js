const express           = require('express');
const router            = express.Router();
const check_in_controller = require("./../../controllers/location/check_in")

// Create Check in location
router.post("/check_in", check_in_controller.check_in);

module.exports = router;