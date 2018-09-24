const check_in_location_db  = require("./../../database/models/check_in_location");
const user_db               = require("./../../database/models/user");
const account_db            = require("./../../database/models/account");
const logs_db               = require("./../../database/models/logs");
const auth_function         = require("./../../functions/auth");
const location_function     = require("./../../functions/location");

module.exports = {
    /**
     *  POST /api/v1/location/check_in
     */
    check_in: (req, res)=>{
        // Collect longitude and latitude
        let check_in_token  = req.body.token;
        let card_number     = req.body.card_number;
        let pin             = req.body.pin;

        check_in_location_db.findOne({authorization_token: check_in_token}, (err, location)=>{
            // Check to confirm if it is a valid check in location
            if(!location){
                return res.status(401).send({status: false, message: "Invalid Location token"});
            }

            account_db.findOne({card_number: card_number}, (err, account)=>{
                if(!account){
                    return res.status(403).send({status: false, message: "Invalid Card Number"});
                }
                auth_function.verify_password(pin, account.pin, (status)=>{
                    if(!status){
                        return res.status(403).send({status: false, message: "Incorrect Pin"});
                    }

                    // Find the user
                    user_db.findOne({email: account.email}, (err, user)=>{
                        if(err) throw err;
                        
                        let previous_location = {};
                        let new_location = {
                            longitude: location.longitude,
                            latitude: location.latitude
                        }
                        let points = 0;
                        let office_bonus = 0;
                        let home_bonus = 0;

                        // Check if last location is set
                        if(user.last_location.longitude){
                            // Check if the home address is set
                            previous_location = user.last_location;
                            let distance = location_function.compute_distance(previous_location, new_location);
                            points = location_function.points(distance);

                            // Prevent Double Check In
                            if(user.last_location.longitude == new_location.longitude && user.last_location.latitude == new_location.latitude){
                                return res.status(403).send({status: false, message: "User has already been Checked In"});
                            }
                        }
                        
                        if(user.office_address){
                            // Set the office address if no last location is recorded yet
                            previous_location = user.office_address;
                            let distance = location_function.compute_distance(previous_location, new_location);
                            if(!points){
                                points = location_function.points(distance);
                            }
                            office_bonus = location_function.home_office_bonus(points, distance);
                        }
                        
                        if(user.home_address){
                            // Set the home address as the last location if no office address is set
                            previous_location = user.home_address;
                            let distance = location_function.compute_distance(previous_location, new_location);
                            if(!points){
                                points = location_function.points(distance);
                            }
                            home_bonus = location_function.home_office_bonus(points, distance);
                        } 

                        // We need only one bonus between home and office, so we Choose the bonus with the higest points
                        let bonus = home_bonus > office_bonus?home_bonus:office_bonus;

                        let total_points = points + bonus;

                        // Approximate
                        total_points = parseFloat(total_points.toFixed(2));

                        // Update the total points and available points
                        account.total_points += total_points;
                        account.points += total_points;
                        account.save(); // Save the changes to DB

                        // Save the new location as the user last location
                        user.last_location = new_location;
                        user.last_location.address = location.address;
                        user.save();

                        // Save check in log
                        logs_db.create({
                            email: user.email,
                            location_Id: location._id,
                            address: location.address,
                            points: total_points
                        }, (err, status)=>{
                            if(err) throw err;
                            // Send response to client
                            res.send({status: true, message: "Check In Successful"});
                        })

                        
                    });
                });
            });



        });

    }
    

}