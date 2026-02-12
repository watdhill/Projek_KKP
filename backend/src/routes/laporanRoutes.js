const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const laporanArchiveController = require('../controllers/laporanArchiveController');
const laporanSnapshotController = require('../controllers/laporanSnapshotController');

// ============================================
// EXISTING ROUTES - Export Laporan
// ============================================

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

// ============================================
// NEW ROUTES - Archive Management (Layer 1 & 2)
// ============================================

// Archive operations
router.post('/archive/format/:year', laporanArchiveController.archiveFormat);
router.post('/archive/data/:year', laporanArchiveController.archiveData);
router.get('/archive/list', laporanArchiveController.listArchives);
router.get('/archive/:year/formats', laporanArchiveController.getArchivedFormats);
router.get('/archive/:year/data', laporanArchiveController.getArchivedDataCount);
router.delete('/archive/:year', laporanArchiveController.deleteArchive);

// ============================================
// NEW ROUTES - Snapshot Management (Layer 3)
// ============================================

// Snapshot operations
router.get('/snapshots', laporanSnapshotController.listSnapshots);
router.post('/snapshots/generate', laporanSnapshotController.generateSnapshot);
router.get('/snapshots/years', laporanSnapshotController.getAvailableYears);
router.get('/snapshots/:id/download', laporanSnapshotController.downloadSnapshot);
router.delete('/snapshots/:id', laporanSnapshotController.deleteSnapshot);

module.exports = router;

