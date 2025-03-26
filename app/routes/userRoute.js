const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/users',authorizeRoles('client','manager'), userController.getAllUser);
router.get('/users/search',authorizeRoles('manager'), userController.searchUsers);
router.get('/users/statut/:statut',authorizeRoles('manager'), userController.getAllUserByStatut);
router.get('/users/role/:roleId',authorizeRoles('manager'), userController.getAllUserByRole);

router.post('/user/update',authorizeRoles('client'), userController.updateInformations);
router.post('/user/:userId',authorizeRoles('manager'), userController.updateEtatUser);


module.exports = router;