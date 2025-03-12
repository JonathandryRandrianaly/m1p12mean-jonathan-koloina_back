const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const energieMoteurController = require('../controllers/energieMoteurController');

router.get('/energie-moteurs',authorizeRoles('manager','client','mecanicien'),energieMoteurController.getAllEnergieMoteur);
router.get('/energie-moteurs/search',authorizeRoles('manager','client','mecanicien'),energieMoteurController.searchEnergieMoteurs);
router.get('/energie-moteur/statut/:statut',authorizeRoles('manager','client','mecanicien'),energieMoteurController.getAllEnergieMoteurByStatut);

router.post('/energie-moteur',authorizeRoles('manager'),energieMoteurController.createEnergieMoteur);
router.post('/energie-moteur/:energieMoteurId',authorizeRoles('manager'),energieMoteurController.updateEtatEnergieMoteur);

module.exports = router;