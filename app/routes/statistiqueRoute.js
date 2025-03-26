const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const statistiqueController = require('../controllers/statistiqueController');

router.get('/statistique/nombre-personnel', authorizeRoles('manager'), statistiqueController.getNombrePersonnel);
router.get('/statistique/nombre-client', authorizeRoles('manager'), statistiqueController.getNombreClient);
router.get('/statistique/nombre-rdv', authorizeRoles('manager'), statistiqueController.getNombreTotalRdv);
router.get('/statistique/nombre-moyen-rdv', authorizeRoles('manager'), statistiqueController.getNombreMoyenRdv);
router.get('/statistique/taux-interventions', authorizeRoles('manager'), statistiqueController.getInterventionsParCategories);
router.get('/statistique/interventions-employes', authorizeRoles('manager'), statistiqueController.getNombreInterventionsParEmployes);

module.exports = router;