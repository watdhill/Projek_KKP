const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Admin dashboard routes
router.get('/statistics', dashboardController.getStatistics);
router.get('/eselon1-chart', dashboardController.getEselon1Chart);
router.get('/recent-updates', dashboardController.getRecentUpdates);

// Operator dashboard routes
router.get('/operator/statistics', dashboardController.getOperatorStatistics);
router.get('/operator/chart', dashboardController.getOperatorChart);
router.get('/operator/recent-updates', dashboardController.getOperatorRecentUpdates);

module.exports = router;

