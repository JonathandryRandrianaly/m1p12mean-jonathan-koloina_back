const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/role', roleController.createRole);
router.post('/role/:roleId', authorizeRoles('manager'), roleController.updateEtatRole);

module.exports = router;