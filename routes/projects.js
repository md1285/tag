var express = require('express');
var router = express.Router();
const projectsCtrl = require('../controllers/projects');

function checkAuth(req, res, next) {
  if (req.user) return next();
  res.redirect('/');
}

/* GET users listing. */
router.get('/projects/', checkAuth, projectsCtrl.index);
router.post('/projects/', checkAuth, projectsCtrl.create);

router.get('/projects/new', checkAuth, projectsCtrl.new);

router.get('/projects/:id', checkAuth, projectsCtrl.show);
router.post('/projects/:id', checkAuth, projectsCtrl.submit);
router.delete('/projects/:id', checkAuth, projectsCtrl.delete);

router.get('/projects/:id/search', checkAuth, projectsCtrl.searchPage);
router.post('/projects/:id/search', checkAuth, projectsCtrl.searchResults);

router.post('/projects/:id/users', checkAuth, projectsCtrl.addUser);

router.get('/projects/:id/approvals', checkAuth, projectsCtrl.approve);

router.get('/projects/:id/rejections', checkAuth, projectsCtrl.reject);

router.get('/projects/:id/versions/:vid', checkAuth, projectsCtrl.version);

module.exports = router;

