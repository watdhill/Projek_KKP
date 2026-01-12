const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/statistics', dashboardController.getStatistics);

module.exports = router;
