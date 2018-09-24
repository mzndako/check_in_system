// const adminDB = require("./../database/models/admin");
const config = require("./../config/config");

// compute Rad function
let toRad = (value)=>{
    return value * Math.PI / 180;
}

let compute_distance = (start_location, end_location)=>{
     let lat2 = start_location.latitude; 
     let lon2 = start_location.longitude; 
     let lat1 = end_location.latitude; 
     let lon1 = end_location.longitude; 
     
     let R = 6371; // km 
     let x1 = lat2-lat1;
     let dLat = toRad(x1);  
     let x2 = lon2-lon1;
     let dLon = toRad(x2);  
     let a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                     Math.sin(dLon/2) * Math.sin(dLon/2);  
     let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
     let d = R * c; 
     
     return d;
}

let points = (distance)=>{
    return distance * config.points_per_km;
}

let dollars = (points)=>{
    let amount = points/config.points_to_a_dollar;
    return amount.toFixed(2);
}

let convert_amount_to_points = (amount)=>{
    return amount * config.points_to_a_dollar;
}

let home_office_bonus = (points, distance)=>{
    let increment = distance/config.km_increase;
    if(increment >= 1){
        let percent = points * (config.percentage_increase/100);
        let total_increment = percent * increment;
        return points + total_increment;
    }
    return 0;
}

let format_amount = (amount)=>{
    return config.currency + " " + amount;
}



module.exports = {
    compute_distance,
    points,
    dollars,
    home_office_bonus,
    format_amount,
    convert_amount_to_points
}