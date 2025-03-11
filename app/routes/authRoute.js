const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/decodeToken',authController.decodeToken);
router.get('/checkPasswordLink', authController.checkValiditeLien);

router.post('/register', authController.inscription);
router.post('/login',authController.login);
router.post('/addEmployees', authorizeRoles('manager'), authController.addEmployés);
router.post('/updatePassword', authController.updatePassword);

module.exports = router;