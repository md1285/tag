require('dotenv').config();

// utility to initialize database
require('./config/database');

const Project = require('./models/project');
const User = require('./models/user');
//run this to log all projects with populated versions

Project.find({})
.then(function(projects){
    projects.forEach(function(project){
        project.populate('versions');
        console.log('PROJECTS: ');
        console.log(project);
    });
})
.then(function(){
    return User.find({});
})
.then(function(users){
    console.log('USERS: ')
    console.log(users);
})
.then(function(){
    process.exit();
});

