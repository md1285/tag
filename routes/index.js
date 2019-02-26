var express = require('express');
var router = express.Router();
const passport = require('passport');
const indexCtrl = require('../controllers/index');


/* GET home page. */
router.get('/', indexCtrl.index);

//authentication routes
router.get('/auth/google', passport.authenticate(
    'google',
    { scope: ['profile', 'email'] }
));

router.get('/oauth2callback', passport.authenticate(
    'google',
    {
        successRedirect: '/projects', /* update these paths to where we want users redirected after logging in */
        failureRedirect: '/'
    }
));

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
