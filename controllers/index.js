const User = require('../models/user');

module.exports = {
    index,
    about
}

function about(req, res) {
    res.render('about', {
        title: 'About',
        user: req.user
    });
}

function index(req, res, next) {
    if (req.user) {
        res.render('index', {
            title: 'Landing',
            user: req.user,
        });
    } else {
        res.redirect('/about');
    }
}