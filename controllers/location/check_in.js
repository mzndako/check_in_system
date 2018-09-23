const check_in_location_db = require("./../../database/models/check_in_location");

module.exports = {
    /**
     *  POST /api/v1/location/check_in
     */
    check_in: (req, res)=>{
        // Collect logitude and latitude
        let check_in_token  = req.body.token;
        let card_number     = req.body.card_number;
        let pin             = req.body.pin;

        check_in_location_db.findOne({authorization_token: check_in_token}, (err, location)=>{
            if(!location){
                // Check to confirm if its valid location
                return res.status(403).send({status: false, message: "Invalid Location token"});
            }
            
        });

    }
    

}