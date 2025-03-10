const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/register', authController.inscription);
router.post('/login',authController.login);
router.get('/decodeToken',authController.decodeToken);
router.post('/addEmployees', authorizeRoles('manager'), authController.addEmployés);
router.get('/checkPasswordLink', authController.checkValiditeLien);
router.post('/updatePassword', authController.updatePassword);

module.exports = router;