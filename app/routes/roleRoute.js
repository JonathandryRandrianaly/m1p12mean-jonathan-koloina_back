const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/role', authorizeRoles('manager'), roleController.createRole);
router.post('/role/:roleId', authorizeRoles('manager'), roleController.updateEtatRole);
router.get('/roles',authorizeRoles('manager'), roleController.getAllRole);
router.get('/roles/statut/:statut',authorizeRoles('manager'), roleController.getAllRoleByStatut);

module.exports = router;