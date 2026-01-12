const express = require('express');
const router = express.Router();
const aplikasiController = require('../controllers/aplikasiController');

router.get('/', aplikasiController.getAllAplikasi);
router.get('/:id', aplikasiController.getAplikasiById);
router.post('/', aplikasiController.createAplikasi);
router.put('/:id', aplikasiController.updateAplikasi);
router.delete('/:id', aplikasiController.deleteAplikasi);

module.exports = router;
