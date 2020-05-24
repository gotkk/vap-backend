const router = require('express-promise-router')();
const AirPollutionController = require('../controllers/airPollutionController');


router.route('/upload').post(AirPollutionController.insertAirPollutionPM25);
router.route('/update_geometry').get(AirPollutionController.addGeomColumnAirPollutionPM25);
router.route('/download_template').post(AirPollutionController.getInsertTemplate);
router.route('/download_avgpm25_country').post(AirPollutionController.getAvgPm25ByCountry);
router.route('/download_country_city_pmthan50').post(AirPollutionController.getCountryAndCityPMthan50);
router.route('/clear').get(AirPollutionController.clearAirPollutionPM25);
router.route('/historypm25_country/:country').get(AirPollutionController.getHistoryPM25byCountry);
router.route('/total_population').post(AirPollutionController.getTotalPopulationbyYearandColorPM25);
router.route('/visual_all_point/:year').get(AirPollutionController.getAllCityPointAllCountrybyYear);
router.route('/50closest_bangkok').get(AirPollutionController.get50ClosestBangkok);
router.route('/neighbor_bangkok').get(AirPollutionController.getNeighborThailand);
router.route('/maxmin_latln_mbr').get(AirPollutionController.getMinMaxLatLnThaiForMBR);
router.route('/highest_no_city').get(AirPollutionController.getHighestPoint);
router.route('/low_income/:year').get(AirPollutionController.getLowIncome);

module.exports = router;