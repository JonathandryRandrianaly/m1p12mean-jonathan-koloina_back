const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/factures/search', authorizeRoles('client','mecanicien','manager'), factureController.searchFacture);

router.post('/facture-check/:entretienId', authorizeRoles('manager'), factureController.checkFacture);
router.post('/facture/assign', authorizeRoles('manager'), factureController.assignEntretienToFacture);

module.exports = router;