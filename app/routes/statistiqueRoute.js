const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const statistiqueController = require('../controllers/statistiqueController');

router.get('/statistique/nombre-personnel', authorizeRoles('manager'), statistiqueController.getNombrePersonnel);
router.get('/statistique/nombre-client', authorizeRoles('manager'), statistiqueController.getNombreClient);

module.exports = router;