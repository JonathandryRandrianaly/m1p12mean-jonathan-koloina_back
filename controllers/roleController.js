const Role = require('../models/role');

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

exports.deleteRole = async (req, res) => {
    const { roleId } = req.params;

    try {
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé.' });
        }

        role.etat = { code: -10, libelle: 'Inactif' };
        await role.save();

        return res.status(200).json({ message: 'Role supprimé avec succès', role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};
