var express = require('express');
var router = express.Router();
const projectsCtrl = require('../controllers/projects');


/* GET users listing. */
router.get('/projects/new', projectsCtrl.new);
router.post('/projects/', projectsCtrl.create);
router.get('/projects/', projectsCtrl.index);

router.get('/projects/:id', projectsCtrl.show);
router.post('/projects/:id', projectsCtrl.submit);

router.get('/projects/:id/search', projectsCtrl.searchPage);
router.post('/projects/:id/search', projectsCtrl.searchResults);

router.post('/projects/:id/invite', projectsCtrl.addUser);
router.get('/projects/:id/approve', projectsCtrl.approve);
router.get('/projects/:id/reject', projectsCtrl.reject);

router.get('/projects/:id/versions/:vid', projectsCtrl.version);

module.exports = router;
