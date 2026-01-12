const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/', masterDataController.getAllMasterData);
router.get('/:id', masterDataController.getMasterDataById);
router.post('/', masterDataController.createMasterData);
router.put('/:id', masterDataController.updateMasterData);
router.delete('/:id', masterDataController.deleteMasterData);

module.exports = router;
