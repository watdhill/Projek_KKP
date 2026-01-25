const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/statistics', dashboardController.getStatistics);
router.get('/eselon1-chart', dashboardController.getEselon1Chart);
router.get('/recent-updates', dashboardController.getRecentUpdates);

module.exports = router;

