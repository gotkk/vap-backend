const router = require('express-promise-router')();
const AirPollutionController = require('../controllers/airPollutionController');


router.route('/upload').post(AirPollutionController.insertAirPollutionPM25);
router.route('/update_geometry').get(AirPollutionController.addGeomColumnAirPollutionPM25);
router.route('/clear').get(AirPollutionController.clearAirPollutionPM25);
router.route('/historypm25_country/:country').get(AirPollutionController.getHistoryPM25byCountry);
module.exports = router;