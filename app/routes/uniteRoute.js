const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const uniteController = require('../controllers/uniteController');

router.get('/unites', authorizeRoles('manager','client','mecanicien'), uniteController.getAllUnite);
router.get('/unites/search', authorizeRoles('manager','client','mecanicien'), uniteController.searchUnites);
router.get('/unites/statut/:statut', authorizeRoles('manager','client','mecanicien'), uniteController.getAllUniteByStatut);

router.post('/unite', authorizeRoles('manager'), uniteController.createUnite);
router.post('/unite/:uniteId', authorizeRoles('manager'), uniteController.updateEtatUnite);

module.exports = router;