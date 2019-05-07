// utility to initialize database

require('dotenv').config();
require('./config/database');
const Project = require('./models/project');
const User = require('./models/user');
const data = require('./data');

Project.deleteMany({})
.then(function(){
    return Project.create(data.projects)
})
.then(function(projects){
    projects.forEach(function(project){
        project.populate('versions');
        console.log(project);
    });
})
.then(function(){
    return User.deleteMany({});
})
.then(function(){
    return User.create(data.users);
})
.then(function(users){
    console.log(users);
})
.then(function(){
    process.exit();
});