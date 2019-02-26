// utility to initialize database

require('dotenv').config();
require('./config/database');
const Project = require('./models/project');
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
    process.exit();
});
