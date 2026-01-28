const express = require("express");
const router = express.Router();
const dynamicMasterController = require("../controllers/dynamicMasterController");

// Management tabel master data dinamis
router.get("/tables", dynamicMasterController.getAllMasterTables);
router.get("/table-info/:tableName", dynamicMasterController.getTableInfo);
router.get(
  "/tables/:registryId/columns",
  dynamicMasterController.getTableColumns,
);
router.post("/tables", dynamicMasterController.createMasterTable);
router.put("/tables/:registryId", dynamicMasterController.updateMasterTable);
router.delete("/tables/:registryId", dynamicMasterController.deleteMasterTable);

// Utilities
router.post("/reload-config", dynamicMasterController.reloadTableConfig);
router.get("/available-types", dynamicMasterController.getAvailableTypes);

module.exports = router;
