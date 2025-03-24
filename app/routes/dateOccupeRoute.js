const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const dateOccupeController = require('../controllers/dateOccupeController');

router.get('/date-occupe',authorizeRoles('manager','client','mecanicien'),dateOccupeController.getDateOccupe);
router.get('/getDateOccupe/:date',authorizeRoles('manager','client','mecanicien'),dateOccupeController.isDateOccupe);

router.post('/setDateOccupe/:date',authorizeRoles('manager','client','mecanicien'),dateOccupeController.setDate);

module.exports = router;