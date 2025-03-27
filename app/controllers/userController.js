const User= require('../models/User');
const userService = require('../services/userService');

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find().populate('roles');
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUserByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const users = await User.find({'etat.code': statut}).populate('roles');
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUserByRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const users = await User.find({ roles: roleId }).populate('roles');
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        if (user.etat.code === -10) {
            user.etat = { code: 10, libelle: 'Actif' };
        } else {
            user.etat = { code: -10, libelle: 'Inactif' };
        }

        await user.save();

        return res.status(200).json({ message: 'État de user mis à jour avec succès', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateInformations = async (req, res) => {
    const {userId, nom, dateNaissance, telephone} = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }
        user.nom=nom;
        user.dateNaissance=dateNaissance;
        user.telephone=telephone;
        await user.save();
        res.status(201).json({ message: "Informations modifiées avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await userService.searchUsers(searchParams);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};