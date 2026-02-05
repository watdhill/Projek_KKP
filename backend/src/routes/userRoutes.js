const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
  validateResetPassword,
  validateForgotPassword,
  validateId,
} = require("../middleware/validate");

router.post("/auth/login", validateLogin, userController.login);
router.post(
  "/auth/forgot-password",
  validateForgotPassword,
  userController.forgotPassword,
);
router.post(
  "/auth/reset-password",
  validateResetPassword,
  userController.resetPassword,
);
router.get("/", userController.getAllUsers);
router.get("/:id", validateId, userController.getUserById);
router.post("/", validateCreateUser, userController.createUser);
router.put("/:id", validateUpdateUser, userController.updateUser);
router.delete("/:id", validateId, userController.deleteUser);
router.put("/:id/profile", validateUpdateUser, userController.updateProfile);
router.put(
  "/:id/change-password",
  validateChangePassword,
  userController.changePassword,
);

module.exports = router;
