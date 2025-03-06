const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.inscription);
router.post('/login',authController.login);
router.get('/testToken',authController.testToken);

module.exports = router;