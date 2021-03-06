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
    reject,
    version,
    delete: deleteProject
}

function deleteProject(req, res) {
    //query the db for the project with the req.params.id
    Project.findById(req.params.id)
        .populate('users')
        .populate('approvals')
        .then(function (project) {
            //if logged in user is a user on project...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //remove current user from approvals and users arrays
                project.approvals = project.approvals.filter(user => user.id !== req.user.id);
                project.users = project.users.filter(user => user.id !== req.user.id);
                // if users array is empty 
                if (!project.users[0]) {
                    // delete project and redirect
                    project.delete(function (err) {
                        res.redirect('/projects');
                    });
                    //if users array is not empty    
                } else {
                    // if pending version does not exist
                    if (!project.pendingVersion) {
                        //save project and exit without modifying versions at all
                        project.save(function (err) {
                            res.redirect('/projects');
                        });
                        // if PV does exist  
                    } else {
                        //if approvals is empty
                        if (project.approvals.length === 0) {
                            project.pendingVersion.approved = false;
                            project.versions.push(project.pendingVersion);
                            //set pending version to null
                            project.pendingVersion = null;
                            //save project and redirect to project page
                            project.save(function (err) {
                                res.redirect('/projects/');
                            })
                            //if approvals is not empty
                        } else {
                            // if approvals.length === users.length 
                            if (project.approvals.length === project.users.length) {
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
                                    res.redirect('/projects/');
                                })
                                //if approvals.length !== users.length
                            } else {
                                // save project and exit without modifying versions at all
                                project.save(function (err) {
                                    res.redirect('/projects');
                                });
                            }
                        }
                    }
                }
                //if logged in user is not a user on project...
            } else {
                //redirect to home
                res.redirect('/');
            }
        })
}

function version(req, res) {
    //query the db to find the project with id === req.params.id
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //if logged in user is an approved user on project...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //sort project versions from most to least recent
                project.versions.sort(function (a, b) {
                    return b.updatedAt - a.updatedAt;
                });
                res.render('projects/version', {
                    project,
                    version: project.versions[req.params.vid],
                    user: req.user,
                    title: project.name
                });
                //if logged in user is not an approved user on project...
            } else {
                //redirect to home
                res.redirect('/');
            }
        });
}

//rejects an edit
function reject(req, res) {
    //query the db for the project with project id === req.params.id and populate users array
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //if the logged in user is in the project's users array
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //clear approvals array
                project.approvals = [];
                //push pending version into versions array with approval: false
                project.pendingVersion.approved = false;
                project.versions.push(project.pendingVersion);
                //set pending version to null
                project.pendingVersion = null;
                //save project and redirect to project page
                project.save(function (err) {
                    res.redirect(`/projects/${req.params.id}`);
                })
                //if the logged in user is NOT in the project's users array
            } else {
                //redirect to home
                res.redirect('/');
            }
        });
}

//approves an edit
function approve(req, res) {
    //query the db for the project with id === req.params.id, populating the users and approvals arrays
    Project.findById(req.params.id)
        .populate('users')
        .populate('approvals')
        .then(function (project) {
            console.log(project);
            //if user's id exists in the approved users array but does not exist on the approvals array...
            if (project.users.filter(user => user.id === req.user.id)[0] && !project.approvals.filter(user => user.id === req.user.id)[0]) {
                //push the logged in user's id into the approvals array
                project.approvals.push(req.user.id);
                //if approvals array length now matches users array length...    
                if (project.approvals.length === project.users.length) {
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
                    //if not...
                } else {
                    //a. save project to db and...
                    project.save(function (err) {
                        // b. redirect to project page
                        res.redirect(`/projects/${req.params.id}`);
                    })
                }
                //if user is not authorized OR has already approved this edit
            } else {
                res.redirect('/');
            }
        });
}

//submits an edit
function submit(req, res) {
    //query the db to find project with id === req.params.id, populating the users array
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //if the logged in user is an approved user for this project...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //if the project has pending approvals...
                if (project.approvals[0]) {
                    res.redirect(`/projects/${req.params.id}`)
                    //if the project has no pending approvals...
                } else {
                    //push the logged in user into the approvals array
                    project.approvals.push(req.user.id);
                    //if the users array is the same length as the users array (should only happen on single user projects)...
                    if (project.approvals.length === project.users.length) {
                        //push a new version into the proj's versions array with content from the submission and approved: true
                        project.versions.push({ content: req.body.content, approved: true });
                        //clear the project approvals array
                        project.approvals = [];
                        //save project and redirect to project show page
                        project.save(function (err) {
                            res.redirect(`/projects/${req.params.id}`);
                        })
                        //if users array is not the same length as approvals array (i.e., if there are multiple users on a project)
                    } else {
                        //make a pending version on the current project, with content from the submission and approved: false 
                        project.pendingVersion = { content: req.body.content, approved: false };
                        //save the project and redirect to project show page
                        project.save(function (err) {
                            res.redirect(`/projects/${req.params.id}`);
                        })
                    }
                }
                //if the logged in user is NOT an approved user for this project...
            } else {
                res.redirect('/');
            }
        })
}

//adds a user to current project
function addUser(req, res) {
    //query the db for a project with id equal to req.params.id, populating the users
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //if current user is authorized on this proj...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //if the user we are attempting to invite already exists on the project's users array...
                if (project.users.filter(user => user.id === req.body.inviteId)[0]) {
                    //redirect to project page
                    res.redirect(`/projects/${req.params.id}`);
                    //if the user we are attempting to invite does not exist on the project's users array...
                } else {
                    //push the invited user into the project's user's array
                    project.users.push(req.body.inviteId);
                    //save the project to the db
                    project.save(function (err) {
                        //and redirect back to the project page
                        res.redirect(`/projects/${req.params.id}`);
                    });
                }
                //if current user is not authorized on this proj, redirect to home
            } else {
                res.redirect('/');
            }
        })
}

//displays search result to add to project
function searchResults(req, res) {
    //b. create queriedProj variable
    let queriedProj;
    //c. query the database to find the project defined by the req.params.id, populating users array
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //d. if the logged in user is an authorized user on this project...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //e. assign queriedProj the project that we found in step c.
                queriedProj = project;
                //f. query the database for the user with the email address entered in the search
                User.findOne({ email: req.body.email })
                    .then(function (foundUser) {
                        //g. render the page "projects/search-results", passing it the logged in user data, the user found from the search, and the project found from the req.params.id
                        if (foundUser) {
                            res.render('projects/search-results', {
                                title: project.name,
                                user: req.user,
                                foundUser,
                                project: queriedProj
                            });
                        } else {
                            res.redirect('back');
                        }
                    });
                //if not, redirect to home
            } else {
                res.redirect('/');
            }
        })
    //if not, redirect to home
}

//displays search page to find a user to add to project
function searchPage(req, res) {
    //query the db for project in req.params.id, populating the users array
    Project.findById(req.params.id)
        .populate('users')
        .then(function (project) {
            //if the project's users array contains the logged in user's id...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
                //render search users page
                res.render('projects/search-users', {
                    title: project.name,
                    user: req.user,
                    project
                });
                //if not, redirect to home
            } else {
                res.redirect('/');
            }
        });
}

//displays a project
function show(req, res) {
    //find the project in the req.params.id, populating the users...
    Project.findById(req.params.id)
        .populate('users')
        .populate('approvals')
        .then(function (project) {
            //if the logged in user is a user on the project...
            if (project.users.filter(user => user.id === req.user.id)[0]) {
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
                        approvals: project.approvals
                    });
                }
                //if not, redirect to home
            } else {
                res.redirect('/');
            }
        })
}

//display all logged in user's projects
function index(req, res) {
    //if there is a logged in user
    if (req.user) {
        //query the db for all projects that include logged in user and display them
        Project.find({ users: { $in: [req.user] }, }, function (err, projects) {
            res.render('projects', {
                title: 'All Projects Page',
                user: req.user,
                projects
            });
        });
        //if not, redirect to home
    } else {
        res.redirect('/');
    }
}

//displays new projects page
function newProject(req, res) {
    res.render('projects/new', {
        user: req.user,
        title: 'New Project Page'
    });
}

//creates a new project
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