const express           = require('express');
const app               = express();
const router            = express.Router();


router.use(require("./auth/auth"));

// Import the location route
router.use(require("./location/check_in"));

// Import the admin activity route
router.use("/admin",  require("./admin/admin"));

module.exports = router;


// client 