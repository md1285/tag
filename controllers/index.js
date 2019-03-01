const User = require('../models/user');

module.exports = {
    index,
    about
}

function about(req, res){
    res.render('about', {
        title: 'About',
        user: req.user
    })
}

function index(req, res, next) {
    res.render('index', { 
        title: 'Landing',
        user: req.user,
    });
  }

