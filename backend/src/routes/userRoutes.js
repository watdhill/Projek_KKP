const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/auth/login', userController.login);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/profile', userController.updateProfile);
router.put('/:id/change-password', userController.changePassword);

module.exports = router;
