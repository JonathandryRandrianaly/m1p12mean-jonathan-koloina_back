const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.inscription);
router.post('/login',authController.login);
router.get('/decodeToken',authController.decodeToken);

module.exports = router;