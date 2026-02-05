const express = require("express");
const router = express.Router();
const aplikasiController = require("../controllers/aplikasiController");
const {
  validateCreateAplikasi,
  validateUpdateAplikasi,
} = require("../middleware/validate");

router.get("/", aplikasiController.getAllAplikasi);
router.get("/:id", aplikasiController.getAplikasiById);
router.post("/", validateCreateAplikasi, aplikasiController.createAplikasi);
router.put("/:id", validateUpdateAplikasi, aplikasiController.updateAplikasi);
router.delete("/:id", aplikasiController.deleteAplikasi);

module.exports = router;
