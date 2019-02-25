var express = require('express');
var router = express.Router();
const projectsCtrl = require('../controllers/projects');


/* GET users listing. */
router.get('/projects/new', projectsCtrl.new);
router.post('/projects/', projectsCtrl.create);

module.exports = router;
