const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/facture-check/:entretienId', authorizeRoles('manager'), factureController.checkFacture);

module.exports = router;