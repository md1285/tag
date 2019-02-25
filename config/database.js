const mongoose = require('mongoose');

//use below when not seeding
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

//use below when seeding
// mongoose.connect('mongodb://localhost:27017/tag', {useNewUrlParser: true});

mongoose.connection.on('connected', function() {
    console.log(`Connected to MongoDB at ${process.env.DATABASE_URL}`);
});
