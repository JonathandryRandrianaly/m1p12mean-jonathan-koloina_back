const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const categorieEntretienController = require ('../controllers/categorieEntretienController');

router.get('/categorie-entretiens', authorizeRoles('manager','client','mecanicien'), categorieEntretienController.getAllCategorieEntretien);
router.get('/categorie-entretiens/search', authorizeRoles('manager','client','mecanicien'), categorieEntretienController.searchCategorieEntretiens);
router.get('/categorie-entretiens/statut/:statut', authorizeRoles('manager','client','mecanicien'), categorieEntretienController.getAllCategorieEntretienByStatut);

router.post('/categorie-entretien', authorizeRoles('manager'), categorieEntretienController.createCategorieEntretien);
router.post('/categorie-entretien/:categorieEntretienId', authorizeRoles('manager'), categorieEntretienController.updateEtatCategorieEntretien);

module.exports = router;