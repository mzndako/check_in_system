var database = process.env.DATABASE || "TRACKING";
console.log("database", database);
module.exports = {
    'database' : 'mongodb://localhost:27017/'+database.trim()
};

                                     