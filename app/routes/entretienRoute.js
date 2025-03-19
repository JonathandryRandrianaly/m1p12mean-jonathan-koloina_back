const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretienController');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const authController = require("../controllers/authController");

router.get('/entretien/mecaniciens/:detailEntretienId', authorizeRoles('manager'), entretienController.getOrdreMecaniciens);
router.get('/entretiens/month/:month', authorizeRoles('manager'), entretienController.getEntretienByMonth);
router.get('/entretiens/detail/:date', authorizeRoles('manager'), entretienController.getEntretienDetailByDate);
router.get('/entretien/details/:detailEntretienId', authorizeRoles('manager'), entretienController.getDetailEntretienById);
router.get('/entretiens/rdv/:clientId', authorizeRoles('client'), entretienController.getRdvByClient);
router.get('/entretiens/detail-personnel/:date/:userId', authorizeRoles('mecanicien','manager'), entretienController.getEntretienDetailByDatePersonnel);

router.post('/entretien/demande-service', authorizeRoles('manager','client','mecanicien'), entretienController.enregistrerDemandeService);
router.post('/entretien/mecanicien/assigner', authorizeRoles('manager'), entretienController.assignerMecano);
router.post('/entretien/update-status', authorizeRoles('mecanicien','manager'), entretienController.updateStatusDetail);

module.exports = router;