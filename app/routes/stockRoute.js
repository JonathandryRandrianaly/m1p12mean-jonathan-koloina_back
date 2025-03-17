const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');
const stockController = require('../controllers/stockController');

router.get('/stock/mouvements',authorizeRoles('manager'),stockController.getHistoriqueMouvements);

router.post('/stock',authorizeRoles('manager'),stockController.createMouvementStock);

module.exports = router;