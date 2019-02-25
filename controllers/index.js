const User = require('../models/user');

module.exports = {
    index,
    
}

function index(req, res, next) {
    console.log(req.user);
    res.render('index', { 
        title: 'Landing',
        user: req.user,
    });
  }

