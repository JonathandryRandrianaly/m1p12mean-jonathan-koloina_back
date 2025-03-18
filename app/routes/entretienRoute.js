const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretienController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/entretien/mecaniciens/:detailEntretienId', authorizeRoles('manager'), entretienController.getOrdreMecaniciens);

router.post('/entretien/demande-service', authorizeRoles('manager','client','mecanicien'), entretienController.enregistrerDemandeService);
router.post('/entretien/mecanicien/assigner', authorizeRoles('manager'), entretienController.assignerMecano);

module.exports = router;