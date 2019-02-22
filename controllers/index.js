const User = require('../models/users');

module.exports = {
    index
}

function index(req, res, next) {
    res.render('index', { title: 'Landing' });
  }