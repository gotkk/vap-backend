const router = require('express-promise-router')();
const AirPollutionController = require('../controllers/airPollutionController');


router.route('/upload').post(AirPollutionController.insertAirPollutionPM25);
router.route('/update_geometry').get(AirPollutionController.addGeomColumnAirPollutionPM25);
router.route('/clear').get(AirPollutionController.clearAirPollutionPM25);
router.route('/historypm25_country/:country').get(AirPollutionController.getHistoryPM25byCountry);
router.route('/total_population').post(AirPollutionController.getTotalPopulationbyYearandColorPM25);
router.route('/visual_all_point/:year').get(AirPollutionController.getAllCityPointAllCountrybyYear);
module.exports = router;