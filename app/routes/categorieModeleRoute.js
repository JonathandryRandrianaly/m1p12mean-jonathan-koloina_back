const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const categorieModeleController = require ('../controllers/categorieModeleController');

router.get('/categorie-modele', authorizeRoles('manager','client','mecanicien'), categorieModeleController.getAllCategorieModele);
router.get('/categorie-modeles/search', authorizeRoles('manager','client','mecanicien'), categorieModeleController.searchCategorieModeles);
router.get('/categorie-modeles/statut/:statut', authorizeRoles('manager','client','mecanicien'), categorieModeleController.getAllCategorieModeleByStatut);

router.post('/categorie-modele', authorizeRoles('manager'), categorieModeleController.createCategorieModele);
router.post('/categorie-modele/:categorieModeleId', authorizeRoles('manager'), categorieModeleController.updateEtatCategorieModele);

module.exports = router;