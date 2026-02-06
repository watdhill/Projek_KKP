const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

router.get('/', auditLogController.getAllAuditLogs);
router.get('/export', auditLogController.exportAuditLogs);
router.get('/user/:userId', auditLogController.getAuditLogsByUser);
router.post('/', auditLogController.createAuditLog);

module.exports = router;
