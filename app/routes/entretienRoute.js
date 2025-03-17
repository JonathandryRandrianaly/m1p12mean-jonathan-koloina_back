const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretienController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/entretien/demande-service', authorizeRoles('manager','client','mecanicien'), entretienController.enregistrerDemandeService);

module.exports = router;