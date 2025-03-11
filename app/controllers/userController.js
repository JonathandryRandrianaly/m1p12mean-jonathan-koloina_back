const User= require('../models/User');
const mongoose = require("mongoose");

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find().populate('roles');
        if (users.length > 0) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUserByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const users = await User.find({'etat.code': statut}).populate('roles');
        if (users.length > 0) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUserByRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const users = await User.find({ roles: roleId }).populate('roles');
        if (users.length > 0) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }
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
        const { page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', roles = [], nom = '' } = req.query;
        const defaultSortedColumn = sortedColumn || 'nom';
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const sortOrder = sortDirection === 'desc' ? -1 : 1;
        let query = {};
        if (nom) {
            query.nom = { $regex: nom, $options: 'i' };
        }
        if (roles.length > 0) {
            query.roles = { $in: roles.map(roleId => new mongoose.Types.ObjectId(roleId)) };
        }
        const totalItems = await User.countDocuments(query);
        const users = await User.find(query)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .populate('roles');
        if (defaultSortedColumn === 'roles') {
            users.sort((a, b) => {
                const roleA = a.roles.map(role => role.libelle).join(', ').toLowerCase();
                const roleB = b.roles.map(role => role.libelle).join(', ').toLowerCase();
                if (roleA < roleB) return sortOrder;
                if (roleA > roleB) return -sortOrder;
                return 0;
            });
        } else {
            users.sort((a, b) => {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                if (aValue < bValue) return sortOrder;
                if (aValue > bValue) return -sortOrder;
                return 0;
            });
        }
        res.json({
            totalItems: totalItems,
            items: users,
        });
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};