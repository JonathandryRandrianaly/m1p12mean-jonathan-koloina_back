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

exports.getNombreMoyenRdv = async (type) => {
    try {
        let groupId = {
            year: { $year: "$entretien.date" },
            month: { $month: "$entretien.date" }
        };

        if (type === 'jour') {
            groupId.day = { $dayOfMonth: "$entretien.date" };
        }
        const result = await DetailEntretien.aggregate([
            {
                $lookup: {
                    from: "entretiens", 
                    localField: "entretien", 
                    foreignField: "_id", 
                    as: "entretien"
                }
            },
            {
                $unwind: "$entretien"
            },
            {
                $group: {
                    _id: groupId,
                    totalRdv: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    moyenneRdv: { $avg: "$totalRdv" }
                }
            }
        ]);
        return result.length > 0 ? result[0].moyenneRdv : 0;
    } catch (error) {
        console.error('Erreur lors du calcul de la moyenne des RDV :', error);
        throw new Error('Erreur lors du calcul de la moyenne des RDV');
    }
};

