module.exports = {
    new: newProject,
    create
}

function newProject(req, res, next) {
    res.render('projects/new', { 
        title: 'New Project Page',
        user: req.user,
    });
}

function create(req, res, next) {
    
}

