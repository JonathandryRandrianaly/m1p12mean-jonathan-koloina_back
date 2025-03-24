const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/factures/search', authorizeRoles('client','mecanicien','manager'), factureController.searchFacture);
router.get('/factures/details/:factureId', authorizeRoles('client','mecanicien','manager'), factureController.getFullDetails);
router.get('/factures/:factureId', authorizeRoles('client','mecanicien','manager'), factureController.getFullFacture);
router.get('/facture/paiement-total/:factureId', authorizeRoles('client','manager'), factureController.getTotalPaiement);

router.post('/facture-check/:entretienId', authorizeRoles('manager'), factureController.checkFacture);
router.post('/facture/assign', authorizeRoles('manager'), factureController.assignEntretienToFacture);
router.post('/facture/paiement', authorizeRoles('client','manager'), factureController.setEtatPaiement);

module.exports = router;