const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const consommableController = require('../controllers/consommableController');

router.get('/consommables', authorizeRoles('manager','client','mecanicien'), consommableController.getAllConsommable);
router.get('/consommables/search', authorizeRoles('manager','client','mecanicien'), consommableController.searchConsommables);
router.get('/consommable/:consommableId', authorizeRoles('manager','client','mecanicien'), consommableController.getConsommableById);
router.get('/consommables/statut/:statut', authorizeRoles('manager','client','mecanicien'), consommableController.getAllConsommableByStatut);

router.post('/consommable', authorizeRoles('manager'), consommableController.createConsommable);
router.post('/consommable/update', authorizeRoles('manager'), consommableController.updatePrixConsommable);
router.post('/consommable/:consommableId', authorizeRoles('manager'), consommableController.updateEtatConsommable);

module.exports = router;