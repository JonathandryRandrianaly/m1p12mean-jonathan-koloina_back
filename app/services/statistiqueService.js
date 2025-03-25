const User = require('../models/User');
const Role = require('../models/Role');

exports.getNombrePersonnel = async () => {
    try {
        const role = await Role.find({libelle : 'mecanicien'});
        const result = await User.countDocuments({roles: { $in: role }});
        return result;
    } catch (error) {
        throw new Error('Erreur lors de get nbr personnel');
    }
};

exports.getNombreClient = async () => {
    try {
        const role = await Role.find({libelle : 'client'});
        const result = await User.countDocuments({roles: { $in: role }});
        return result;
    } catch (error) {
        throw new Error('Erreur lors de get nbr client');
    }
};