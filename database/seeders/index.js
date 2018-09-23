var seeder = require('mongoose-seeder'),
    seedData = require('./data.json');

var runSeeder = function (data) {
    seeder.seed(data, {dropCollections: true, dropDatabase: false})
    .then(function(dbData) {
        // The database objects are stored in dbData
        console.log('Seeded');
    })
    .catch(function(err) {
        // handle error
        console.log('Seed Failed', err);
    });
}

runSeeder(seedData);