const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/role', authorizeRoles('manager'), roleController.createRole);
router.post('/role/:roleId', authorizeRoles('manager'), roleController.updateEtatRole);
router.get('/roles',authorizeRoles('manager','client','mecanicien'), roleController.getAllRole);
router.get('/roles/active',authorizeRoles('manager','client','mecanicien'), roleController.getAllRoleActive);
router.get('/roles/inactive',authorizeRoles('manager','client','mecanicien'), roleController.getAllRoleInactive);

module.exports = router;