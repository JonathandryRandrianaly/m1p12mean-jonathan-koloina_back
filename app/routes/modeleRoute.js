const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const modeleController = require('../controllers/modeleController');

router.get('/modeles', authorizeRoles('manager','client','mecanicien'), modeleController.getAllModele);
router.get('/modeles/search', authorizeRoles('manager','client','mecanicien'), modeleController.searchModeles);
router.get('/modeles/statut/:statut', authorizeRoles('manager','client','mecanicien'), modeleController.getAllModeleByStatut);

router.post('/modele', authorizeRoles('manager'), modeleController.createModele);
router.post('/modele/:modeleId', authorizeRoles('manager'), modeleController.updateEtatModele);

module.exports = router;