const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const typeEntretienController = require('../controllers/typeEntretienController');

router.get('/type-entretiens', authorizeRoles('manager','client','mecanicien'), typeEntretienController.getAllTypeEntretien);
router.get('/type-entretiens/statut/:statut', authorizeRoles('manager','client','mecanicien'), typeEntretienController.getAllTypeEntretienByStatut);

router.post('/type-entretien', authorizeRoles('manager'), typeEntretienController.createTypeEntretien);
router.post('/type-entretien/:typeEntretienId', authorizeRoles('manager'), typeEntretienController.updateEtatTypeEntretien);

module.exports = router;