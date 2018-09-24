const express           = require('express');
const app               = express();
const router            = express.Router();


// Import the location route
router.use("/location", require("./location/check_in"));

// Import the admin activity route
router.use("/admin",  require("./admin/index"));

// Require user route
router.use("/user",  require("./user/index"));

// Require merchant route
router.use("/merchant",  require("./merchant/index"));

module.exports = router;