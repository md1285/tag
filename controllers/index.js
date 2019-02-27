const User = require('../models/user');

module.exports = {
    index,
    
}

function index(req, res, next) {
    res.render('index', { 
        title: 'Landing',
        user: req.user,
    });
  }

