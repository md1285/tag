var express = require('express');
var router = express.Router();
const projectsCtrl = require('../controllers/projects');


/* GET users listing. */
router.get('/projects/new', projectsCtrl.new);
router.post('/projects/', projectsCtrl.create);
router.get('/projects/', projectsCtrl.index);
router.get('/projects/:id', projectsCtrl.show);
router.get('/projects/:id/search', projectsCtrl.searchPage);
router.post('/projects/:id/search', projectsCtrl.searchResults);
router.post('/projects/:id/invite', projectsCtrl.addUser);

module.exports = router;
