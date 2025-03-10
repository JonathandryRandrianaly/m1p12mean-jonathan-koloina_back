const express = require('express');
const router = express.Router();
const marqueController = require('../controllers/marqueController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/marque', authorizeRoles('manager'), marqueController.createMarque);
router.post('/marque/:marqueId', authorizeRoles('manager'), marqueController.updateEtatMarque);
router.get('/marques',authorizeRoles('manager','client','mecanicien'), marqueController.getAllMarque);
router.get('/marques/active',authorizeRoles('manager','client','mecanicien'), marqueController.getAllMarqueActive);
router.get('/marques/inactive',authorizeRoles('manager','client','mecanicien'), marqueController.getAllMarqueInactive);

module.exports = router;