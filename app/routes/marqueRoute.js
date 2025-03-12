const express = require('express');
const router = express.Router();
const marqueController = require('../controllers/marqueController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/marques',authorizeRoles('manager','client','mecanicien'), marqueController.getAllMarque);
router.get('/marques/search',authorizeRoles('manager','client','mecanicien'), marqueController.searchMarques);
router.get('/marques/statut/:statut',authorizeRoles('manager','client','mecanicien'), marqueController.getAllMarqueByStatut);

router.post('/marque', authorizeRoles('manager'), marqueController.createMarque);
router.post('/marque/:marqueId', authorizeRoles('manager'), marqueController.updateEtatMarque);

module.exports = router;