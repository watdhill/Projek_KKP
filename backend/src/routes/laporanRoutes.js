const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');

// Get all format laporan
router.get('/format-laporan', laporanController.getAllFormatLaporan);

// Get format fields for preview
router.get('/format-fields', laporanController.getFormatFieldsForPreview);

// Get preview data with filters
router.get('/preview', laporanController.getPreviewData);

// Export routes
router.get('/export/excel', laporanController.exportExcel);
router.get('/export/excel-all', laporanController.exportExcelAll);
router.get('/export/pdf', laporanController.exportPDF);
router.get('/export/pdf-all', laporanController.exportPDFAll);

module.exports = router;

