const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_controller  = require("./../../controllers/admin/admin");

// Create User
router.post("/",  admin_controller.create_user);

// Get All User
router.get("/", admin_controller.get_users);

// Delete a user
router.delete("/:user_Id", admin_controller.delete_user);

module.exports = router;