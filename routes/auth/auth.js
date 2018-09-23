const express           = require('express');
const router            = express.Router();
const auth_function     = require("./../../functions/auth");
const admin_db     = require("./../../database/models/admin");

router.get("/mz",   (req, res)=>{
    admin_db.findOne({admin: "admin"}, function(err, admin){

        res.send(admin);
    })

})

module.exports = router;