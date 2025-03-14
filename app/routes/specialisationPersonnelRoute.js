const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const specialisationPersonnelController = require('../controllers/specialisationPersonnelController');

router.get('/specialisation-personnel/:userId', authorizeRoles('manager','mecanicien'), specialisationPersonnelController.getAllSpecialisationByUser);

router.post('/specialisation-personnel', authorizeRoles('manager'), specialisationPersonnelController.createSpecialisationPersonnel);
router.post('/specialisations-personnel', authorizeRoles('manager'), specialisationPersonnelController.updatepecialisationPersonnel);

module.exports = router;