var database = process.env.DATABASE || "TRACKING";
module.exports = {
    'database' : 'mongodb://localhost:27017/'+database.trim()
};

                                     