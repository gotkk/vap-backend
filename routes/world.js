
const router = require('express-promise-router')();
const WorldController = require('../controllers/worldController');


router.route('/:name').get(WorldController.getWorldFromName);
module.exports = router;