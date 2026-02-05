const express = require("express");
const router = express.Router();
const masterDataController = require("../controllers/masterDataController");
const laporanFieldController = require("../controllers/laporanFieldController");
const {
  validateMasterDataQuery,
  validateCreateMasterData,
  validateUpdateMasterData,
  validateDeleteMasterData,
} = require("../middleware/validate");
console.log("MasterDataController Keys:", Object.keys(masterDataController));

// Get available types metadata
router.get("/types", masterDataController.getTypes);

// Get dropdown data untuk form
router.get("/dropdown", masterDataController.getDropdownData);

// Get hierarchical report fields
router.get("/laporan-fields", laporanFieldController.getHierarchicalFields);

// CRUD operations with ?type= query parameter
router.get("/", validateMasterDataQuery, masterDataController.getAllMasterData);
router.get(
  "/:id",
  validateMasterDataQuery,
  masterDataController.getMasterDataById,
);
router.post(
  "/",
  validateCreateMasterData,
  masterDataController.createMasterData,
);
router.put(
  "/:id",
  validateUpdateMasterData,
  masterDataController.updateMasterData,
);
router.patch(
  "/:id/status",
  validateUpdateMasterData,
  masterDataController.toggleStatus,
);
router.delete(
  "/:id",
  validateDeleteMasterData,
  masterDataController.deleteMasterData,
);

module.exports = router;
