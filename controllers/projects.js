const Project = require('../models/project');
const User = require('../models/user');

module.exports = {
    new: newProject,
    create,
    index,
    show,
    searchPage,
    searchResults,
    addUser,
    submit,
    approve,
    reject
}

function reject(req, res) {
    Project.findById(req.params.id)
        .then(function (project) {
            // 1. check to see is the logged in user is not an authorized user on this project
            if (!req.user.id || !JSON.stringify(project.users).includes(req.user.id)) {
                // a. if user not authorized, redirect to home
                res.redirect('/');
            } else {
                // b. if user is authorized, continue...
                // 2.  clear approvals array
                project.approvals = [];
                // 3. push pending version into versions array with approval: false
                project.pendingVersion.approved = false;
                project.versions.push(project.pendingVersion);
                // 4. set pending version to null
                project.pendingVersion = null;
                // 5. save project and redirect to project page
                project.save(function (err) {
                    res.redirect(`/projects/${req.params.id}`);
                })
            }
        });
}

function approve(req, res) {
    Project.findById(req.params.id)
        .then(function (project) {
            if (!req.user.id || !JSON.stringify(project.users).includes(JSON.stringify(req.user.id)) || JSON.stringify(project.approvals).includes(JSON.stringify(req.user.id))) {
                //what to do if user is not logged in or not authorized user on this project, OR has already approved this edit
                res.redirect('/');
            } else {
                //everything below here is what happens if user is logged in, authorized on this project, and has not approved current edit
                project.approvals.push(req.user.id);
                //below checks to see if approvals array now matches users array    
                if (JSON.stringify(project.approvals.sort()) === JSON.stringify(project.users.sort())) {
                    //if so...
                    // a. push the pendingVersion into the versions array with approved: true, 
                    project.pendingVersion.approved = true;
                    project.versions.push(project.pendingVersion);
                    // b. clear out the approvals array
                    project.approvals = [];
                    // c. set pending version to null
                    project.pendingVersion = null;
                    // d. save project
                    project.save(function (err) {
                        // e. redirect to project page
                        res.redirect(`/projects/${req.params.id}`);
                    })
                } else {
                    //if not...
                    //redirect to project page
                    res.redirect(`/projects/${req.params.id}`)
                }
            }
        });
}

function submit(req, res) {
    Project.findById(req.params.id)
        .then(function (project) {
            if (project.approvals[0]) {
                res.redirect(`/projects/${req.params.id}`)
            } else {
                project.approvals.push(req.user.id);
                if (JSON.stringify(project.approvals.sort()) === JSON.stringify(project.users.sort())) {
                    project.versions.push({ content: req.body.content, approved: true });
                    project.approvals = [];
                    project.save(function (err) {
                        res.redirect(`/projects/${req.params.id}`);
                    })
                } else {
                    project.pendingVersion = { content: req.body.content, approved: false };
                    project.save(function (err) {
                        res.redirect(`/projects/${req.params.id}`);
                    })
                }
            }
        })
}

function addUser(req, res) {
    Project.findById(req.params.id)
        .then(function (project) {
            if (JSON.stringify(project.users).includes(JSON.stringify(req.body.inviteId))) {
                res.redirect(`/projects/${req.params.id}`);
            } else {
                project.users.push(req.body.inviteId);
                project.save(function (err) {
                    res.redirect(`/projects/${req.params.id}`);
                });
            }
        })
}

function searchResults(req, res) {
    let foundUser;
    let project;
    User.findOne({ email: req.body.email })
        .then(function (searchResult) {
            foundUser = searchResult;
        })
        .then(function () {
            return Project.findById(req.params.id);
        })
        .then(function (queryResult) {
            project = queryResult;
        })
        .then(function () {
            res.render('projects/search-results', {
                title: project.name,
                user: req.user,
                foundUser,
                project
            });
        });
}

function searchPage(req, res) {
    Project.findById(req.params.id)
        .then(function (project) {
            res.render('projects/search-users', {
                title: project.name,
                user: req.user,
                project
            });
        });
}

function show(req, res, next) {
    Project.findById(req.params.id).populate('users')
        .then(function (project) {
            //if approvals array contains no data, proj is editable
            if (!project.approvals[0]) {
                res.render('projects/show-edit', {
                    title: project.name,
                    user: req.user,
                    project,
                });
                //otherwise, it is locked
            } else {
                res.render('projects/show-lock', {
                    title: project.name,
                    user: req.user,
                    project,
                });
            }
        })
}

//finds all projects containing the current logged in user's user id (req.user) in the project's "users" array.
//then displays "projects", passing the user and project information to the view
function index(req, res, next) {
    Project.find({ users: { $in: [req.user] }, }, function (err, projects) {
        res.render('projects', {
            title: 'My Projects',
            user: req.user,
            projects
        });
    });
}
//display new projects page
function newProject(req, res, next) {
    res.render('projects/new', {
        title: 'New Project Page',
        user: req.user,
    });
}

function create(req, res, next) {
    //assign init version to first value of versions array
    req.body.versions = [{ content: req.body.initVersion.slice(), approved: true }];
    //assign user id to users array
    req.body.users = [req.user._id];
    //delete initVersion from req.body
    delete req.body.initVersion;
    //create new project with req.body data
    let project = new Project(req.body);
    project.save(function (err) {
        if (err) return res.redirect('/');
        res.redirect('projects');
    });
}

