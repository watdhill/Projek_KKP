const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

// Get available types metadata
router.get('/types', masterDataController.getTypes);

// Get dropdown data untuk form
router.get('/dropdown', masterDataController.getDropdownData);

// CRUD operations with ?type= query parameter
router.get('/', masterDataController.getAllMasterData);
router.get('/:id', masterDataController.getMasterDataById);
router.post('/', masterDataController.createMasterData);
router.put('/:id', masterDataController.updateMasterData);
router.patch('/:id/status', masterDataController.toggleStatus);
router.delete('/:id', masterDataController.deleteMasterData);

module.exports = router;
