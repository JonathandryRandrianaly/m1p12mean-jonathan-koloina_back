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

exports.getInterventionsParCategories = async ({mois,annee}) => {
    try {
        const total = await DetailEntretien.countDocuments();
        if (total === 0) {
            return []; 
        }

        const matchStage = {};
        if (annee) matchStage.year = { $eq: Number(annee) };
        if (mois){
            const value= mois.split('-');
            matchStage.year = { $eq: Number(value[0]) };
            matchStage.month = { $eq: Number(value[1]) };
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
                $lookup: {
                    from: "typeentretiens", 
                    localField: "typeEntretien", 
                    foreignField: "_id", 
                    as: "typeEntretien"
                }
            },
            {
                $unwind: "$typeEntretien"  
            },
            {
                $lookup: {
                    from: "categorieentretiens", 
                    localField: "typeEntretien.categorieEntretien", 
                    foreignField: "_id", 
                    as: "categorie" 
                }
            },
            {
                $unwind: "$categorie" 
            },
            {
                $addFields: {
                    year: { $year: "$entretien.date" },
                    month: { $month: "$entretien.date" },
                }
            },
            { 
                $match: matchStage
            },
            {
                $group: {
                    _id: { categorie: "$categorie.nom" },
                    count: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    taux: { $multiply: [{ $divide: ["$count", total] }, 100] } 
                }
            },
        ]);

        return result;
    } catch (error) {
        console.error('Erreur lors de interventions by categ', error);
        throw new Error('Erreur lors de interventions by categ');
    }
};


exports.getNombreInterventionsParEmployes = async ({ mois, annee }) => {
    try {
        const matchStage = {};
        if (annee) matchStage.year = { $eq: Number(annee) };
        if (mois){
            const value= mois.split('-');
            matchStage.year = { $eq: Number(value[0]) };
            matchStage.month = { $eq: Number(value[1]) };
        } 

        const result = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "roles",
                    foreignField: "_id",
                    as: "rolesData"
                }
            },
            {
                $match: { "rolesData.libelle": "mecanicien" }
            },
            {
                $lookup: {
                    from: "detailentretiens",
                    localField: "_id",
                    foreignField: "users",
                    as: "details"
                }
            },
            {
                $unwind: {
                    path: "$details",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $lookup: {
                    from: "entretiens",
                    localField: "details.entretien",
                    foreignField: "_id",
                    as: "entretien"
                }
            },
            {
                $unwind: {
                    path: "$entretien",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $addFields: {
                    year: { $year: "$entretien.date" },
                    month: { $month: "$entretien.date" }
                }
            },
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: "$nom",
                    count: { $sum: { $cond: [{ $ifNull: ["$details", false] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                }
            }
        ]);

        return result;
    } catch (error) {
        console.error("Erreur lors de interventions by employes", error);
        throw new Error("Erreur lors de interventions by employes");
    }
};

