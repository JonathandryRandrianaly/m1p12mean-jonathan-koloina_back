const Role = require('../models/Role');

exports.createRole = async (req, res) => {
    const { libelle } = req.body;

    try {
        const existingRole = await Role.findOne({ libelle, 'etat.code': 10 }); 
        if (existingRole) {
            return res.status(400).json({ message: 'Le rôle existe déjà et est actif.' });
        }

        const newRole = new Role({
            libelle,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newRole.save();

        return res.status(201).json({ message: 'Rôle créé avec succès', role: newRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatRole = async (req, res) => {
    const { roleId } = req.params;

    try {
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé.' });
        }

        if (role.etat.code === -10) {
            role.etat = { code: 10, libelle: 'Actif' };
        } else {
            role.etat = { code: -10, libelle: 'Inactif' };
        }

        await role.save();

        return res.status(200).json({ message: 'État du rôle mis à jour avec succès', role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

