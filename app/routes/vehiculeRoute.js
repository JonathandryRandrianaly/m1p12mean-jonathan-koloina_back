const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const vehiculeController = require('../controllers/vehiculeController');

router.get('/vehicules', authorizeRoles('manager','mecanicien'), vehiculeController.getAllVehicule);
router.get('/vehicules/:search', authorizeRoles('client','manager','mecanicien'), vehiculeController.searchVehicules);
router.get('/vehicules/:proprietaire', authorizeRoles('client','manager','mecanicien'), vehiculeController.getAllVehicule);

router.post('/vehicule', authorizeRoles('client'), vehiculeController.createVehicule);
router.post('/vehicule/:vehiculeId', authorizeRoles('client'), vehiculeController.updateEtatVehicule);

module.exports = router;