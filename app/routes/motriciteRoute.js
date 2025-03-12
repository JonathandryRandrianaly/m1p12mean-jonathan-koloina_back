const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const motriciteController = require('../controllers/motriciteController');

router.get('/motricites', authorizeRoles('manager','client','mecanicien'), motriciteController.getAllMotricite);
router.get('/motricites/search', authorizeRoles('manager','client','mecanicien'), motriciteController.searchMotricites);
router.get('/motricites/statut/:statut', authorizeRoles('manager','client','mecanicien'), motriciteController.getAllMotriciteByStatut);

router.post('/motricite', authorizeRoles('manager'), motriciteController.createMotricite);
router.post('/motricite/:motriciteId', authorizeRoles('manager'), motriciteController.updateEtatMotricite);

module.exports = router;