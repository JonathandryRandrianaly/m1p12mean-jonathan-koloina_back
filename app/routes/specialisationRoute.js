const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const specialisationController = require('../controllers/specialisationController');

router.get('/specialisations', authorizeRoles('manager','client','mecanicien'), specialisationController.getAllSpecialisation);
router.get('/specialisations/search', authorizeRoles('manager','client','mecanicien'), specialisationController.searchSpecialisations);
router.get('/specialisations/statut/:statut', authorizeRoles('manager','client','mecanicien'), specialisationController.getAllSpecialisationByStatut);

router.post('/specialisation', authorizeRoles('manager'), specialisationController.createSpecialisation);
router.post('/specialisation/:specialisationId', authorizeRoles('manager'), specialisationController.updateEtatSpecialisation);

module.exports = router;