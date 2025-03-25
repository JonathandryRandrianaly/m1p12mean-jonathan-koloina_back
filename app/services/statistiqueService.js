const User = require('../models/User');
const Role = require('../models/Role');
const DetailEntretien = require('../models/DetailEntretien');

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

exports.getNombreTotalRdv = async () => {
    try {
        const result = await DetailEntretien.countDocuments();
        return result;
    } catch (error) {
        throw new Error('Erreur lors de get nbr rdv');
    }
};