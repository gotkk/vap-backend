const router = require('express-promise-router')();
const AirPollutionController = require('../controllers/airPollutionController');


router.route('/upload').post(AirPollutionController.insertAirPollutionPM25);
router.route('/update_geometry').get(AirPollutionController.addGeomColumnAirPollutionPM25);
router.route('/clear').get(AirPollutionController.clearAirPollutionPM25);
module.exports = router;