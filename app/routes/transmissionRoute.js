const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const transmissionController = require('../controllers/transmissionController');

router.get('/transmissions',authorizeRoles('manager','mecanicien','client'),transmissionController.getAllTransmission);
router.get('/transmissions/statut/:statut',authorizeRoles('manager','mecanicien','client'),transmissionController.getAllTransmissionByStatut);

router.post('/transmission',authorizeRoles('manager'),transmissionController.createTransmission);
router.post('/transmission/:transmissionId',authorizeRoles('manager'),transmissionController.updateEtatTransmission);

module.exports = router;