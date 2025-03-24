const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretienController');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const authController = require("../controllers/authController");
const rapportController = require("../controllers/rapportController");
const rapportService = require("../services/rapportService");
const stockController = require('../controllers/stockController');

router.get('/entretiens/historiques/vehicule', authorizeRoles('mecanicien','manager','client'), entretienController.getHistoriquesEntretienByVehicule);
router.get('/entretien/mecaniciens/:detailEntretienId', authorizeRoles('manager'), entretienController.getOrdreMecaniciens);
router.get('/entretiens/month/:month', authorizeRoles('manager'), entretienController.getEntretienByMonth);
router.get('/entretiens/detail/:date', authorizeRoles('manager'), entretienController.getEntretienDetailByDate);
router.get('/entretien/details/:detailEntretienId', authorizeRoles('manager','mecanicien'), entretienController.getDetailEntretienById);
router.get('/entretiens/rdv/:clientId', authorizeRoles('client'), entretienController.getRdvByClient);
router.get('/entretiens/detail-personnel/:date/:userId', authorizeRoles('mecanicien','manager'), entretienController.getEntretienDetailByDatePersonnel);

router.post('/entretien/demande-service', authorizeRoles('manager','client','mecanicien'), entretienController.enregistrerDemandeService);
router.post('/entretien/mecanicien/assigner', authorizeRoles('manager'), entretienController.assignerMecano);
router.post('/entretien/update-status', authorizeRoles('mecanicien','manager'), entretienController.updateStatusDetail);
router.post('/entretien/details/update-date', authorizeRoles('manager'), entretienController.updateDateDetailEntretien);
router.post('/entretien/rapport', rapportService.upload.array("justificatifs", 5), authorizeRoles('manager','mecanicien'), rapportController.createRapport);
router.post('/entretien/rapport/justificatifs', rapportService.upload.array("justificatifs", 5), authorizeRoles('manager','mecanicien'), rapportController.addJustificatifs);
router.post('/entretien/rapport/remove-fichier',authorizeRoles('manager','mecanicien'), rapportController.removeJustificatifsRapport);
router.post('/entretien/consommable/stock',authorizeRoles('manager','mecanicien'), stockController.sortieStockConsommables);
router.post('/entretien/rdv/annuler',authorizeRoles('manager','client'), entretienController.annulerRdv);
router.post('/entretien/rapport/remove/:rapportId',authorizeRoles('manager','mecanicien'), rapportController.removeRapport);

module.exports = router;