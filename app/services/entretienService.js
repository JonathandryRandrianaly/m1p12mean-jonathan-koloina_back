const Entretien = require("../models/Entretien");
const DetailEntretien = require("../models/DetailEntretien");
const User = require("../models/User");
const SpecialisationPersonnel = require("../models/SpecialisationPersonnel");
const mongoose = require('mongoose');
const moment = require('moment');
const Role = require("../models/Role");
const Vehicule = require("../models/Vehicule");

exports.createEntretien= async ( date, vehiculeId ) => {
    try {
        const newEntretien = new Entretien({
            date,
            vehicule: vehiculeId,
            etat: { code: 0, libelle: 'Creer' }
        });

        await newEntretien.save();
        return newEntretien._id;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.createDetailEntretien= async (entretienId, typeEntretien) => {
    try {
        const newDetail = new DetailEntretien({
            entretien: entretienId,
            typeEntretien,
            etat: { code: -10, libelle: 'A faire' }
        });

        await newDetail.save();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};


exports.getOrdreMecaniciens = async (detailEntretienId) => {
    try {
        const mecano = await User.find().populate("roles");
        const mecaniciens = mecano.filter(user =>
            user.roles.some(role => role.libelle === "mecanicien")
        );
        if (!mecaniciens.length) {
            throw new Error("Aucun mécanicien trouvé");
        }
        const detailEntretien = await DetailEntretien.findById(detailEntretienId)
            .populate("entretien")
            .populate("typeEntretien");

        if (!detailEntretien) {
            throw new Error("Détail d'entretien introuvable");
        }
        const specialisationIds = detailEntretien.typeEntretien.specialisations.map(spec => spec.toString());

        const entretiensMemeDate = await DetailEntretien.find()
            .populate({
                path: "entretien",
                match: { 
                    date: { 
                        $eq: new Date(detailEntretien.entretien.date)
                    }
                }
            })
            .populate("users");

          const entretiensEnCours = entretiensMemeDate.filter(detail => detail.entretien !== null);
    
            const specialisationPromises = mecaniciens.map(mecanicien =>
                SpecialisationPersonnel.find({ user: mecanicien._id }).populate('specialisation')
            );
            
            const specialisationsResult = await Promise.all(specialisationPromises);

            let ordreMecaniciens = await Promise.all(mecaniciens.map(async (mecanicien, index) => {
                const userId = mecanicien._id.toString();
                const spes = specialisationsResult[index];

                const specialisations = spes.map(s => s.specialisation.nom);

                const correspondanceCount = spes
                    ? spes.filter(spec => specialisationIds.includes(spec.specialisation._id.toString())).length
                    : 0;

                const estOccupe = await this.getAssignTaskByPersonnel(new Date(detailEntretien.entretien.date), mecanicien._id);

                return {
                    user: mecanicien,
                    specialisations,
                    correspondanceCount,
                    estOccupe
                };
            }));
            

        ordreMecaniciens.sort((a, b) => {
            if (b.correspondanceCount !== a.correspondanceCount) {
                return b.correspondanceCount - a.correspondanceCount;
            }
            return a.estOccupe - b.estOccupe;
        });

        return ordreMecaniciens;
    } catch (error) {
        console.error("Erreur lors du tri des mécaniciens :", error);
        throw new Error("Erreur lors du tri des mécaniciens");
    }
};



exports.assignerMecano= async ( detailEntretienId, usersId) => {
    try {
        const detailEntretien= await DetailEntretien.findById(detailEntretienId).populate('entretien');
        detailEntretien.users = usersId;
        await detailEntretien.save();
    } catch (error) {
        console.error(error);
    }
};

exports.getEntretienMonth = async (month) => {
    try {
        const startOfMonth = moment().month(month - 1).startOf('month').toDate();
        const endOfMonth = moment().month(month - 1).endOf('month').toDate();

        const entretiens = await Entretien.find({
            date: {
                $gte: startOfMonth,
                $lt: endOfMonth
            }
        }).populate('vehicule');

        return entretiens;
    } catch (error) {
        console.error('Error fetching entretien records:', error);
        throw error;
    }
};

exports.getEntretienDetailByDate = async (date) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const entretiens = await Entretien.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).select('_id');

        const detailsEntretien = await DetailEntretien
            .find({ entretien: { $in: entretiens } })
            .populate([
                {
                    path: 'entretien',
                    populate: {
                        path: 'vehicule',
                        populate: {
                            path: 'modele',
                            populate: {
                                path: 'marque'
                            }
                        }
                    }
                }
            ])
            .populate('typeEntretien');

        return detailsEntretien;
    } catch (error) {
        console.error('Error fetching entretiens:', error);
    }
};

exports.getDetailEntretienById = async (detailEntretienId) => {
    try {
        const detailEntretien= await DetailEntretien.findById(detailEntretienId)
        .populate({
            path: 'entretien',
            select: 'date kilometrage', 
            populate: {
                path: 'vehicule',
                select: 'immatriculation',
                populate: [
                    { path: 'proprietaire', select: 'nom' },
                    { path: 'modele', select: 'nom anneeFabrication', populate: [
                        { path: 'marque', select: 'nom' },
                        { path: 'energieMoteur', select: 'nom' },
                        { path: 'transmission', select: 'nom' },
                        { path: 'motricite', select: 'nom' },
                        { path: 'categorie', select: 'nom' }
                    ]}
                ]
            }
        })
        .populate({
            path:'typeEntretien',
            select: 'nom description prix'
        })
        .populate({
            path:'users',
            select:'nom'
        });
        return detailEntretien;
    } catch (error) {
        console.error('Error get Detail:', error);
    }
};


exports.updateStatusDetail = async (detailEntretienId, etatCode, etatLibelle) => {
    try {
        const existingDetail = await DetailEntretien.findById(detailEntretienId);
        if (!existingDetail) {
            return res.status(404).json({ message: 'Entretien non trouvé' });
        }

        existingDetail.etat = {
            code: etatCode,
            libelle: etatLibelle
        };
        await existingDetail.save();
        return existingDetail._id;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getRdvByClient = async (clientId) => {
    try {
        const vehicules = await Vehicule.find({ proprietaire: clientId });
        const entretiens = await Entretien.find({vehicule: { $in: vehicules}})
        .populate('vehicule')
        .sort({date: -1});
        const detailsEntretiens= await DetailEntretien.find({entretien: {$in: entretiens}, 'etat.code': { $ne: 20 }})
        .populate({path: 'entretien', populate: 'vehicule'})
        .populate('typeEntretien')
        .populate('users');
        detailsEntretiens.sort((a, b) => {
            const indexA = entretiens.findIndex(entretien => entretien._id.toString() === a.entretien._id.toString());
            const indexB = entretiens.findIndex(entretien => entretien._id.toString() === b.entretien._id.toString());
            return indexA - indexB; 
          });
        return detailsEntretiens;
    } catch (error) {
        console.error('Error get Rdv:', error);
    }
};

exports.getEntretienDetailByDateByPersonnel = async (date,userId) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const entretiens = await Entretien.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).select('_id');

        const detailsEntretien = await DetailEntretien
            .find({
                entretien: { $in: entretiens },
                users: { $in: [userId] }
            })
            .populate([
                {
                    path: 'entretien',
                    populate: {
                        path: 'vehicule',
                        populate: {
                            path: 'modele',
                            populate: {
                                path: 'marque'
                            }
                        }
                    }
                }
            ])
            .populate('typeEntretien');

        return detailsEntretien;
    } catch (error) {
        console.error('Error fetching entretiens:', error);
    }
};

exports.getAssignTaskByPersonnel = async (date,userId) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const entretiens = await Entretien.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).select('_id');

        const count = await DetailEntretien.countDocuments({
            entretien: { $in: entretiens },
            users: userId
        });
        return count || 0;
    } catch (error) {
        console.error('Error getting DetailEntretien count:', error);
        throw error;
    }
};

exports.updateDateDetailEntretien = async (detailEntretienId, dateDebut, dateFin) => {
    try {
        const detailEntretien = await DetailEntretien.findById(detailEntretienId).populate('entretien');
        let success = false;
        if(dateDebut !== ''){
            if(detailEntretien.entretien.date <= new Date(dateDebut)){
                detailEntretien.dateDebut = dateDebut;
                success =true;
            }
        }
        if(dateFin !== ''){
            if(detailEntretien.entretien.date <= new Date(dateFin)){
                detailEntretien.dateFin = dateFin;
                success =true;
            }
        }
        if(success === true){
            await detailEntretien.save();
        }
        return success;
    } catch (error) {
        console.error('Error get Rdv:', error);
    }
};

exports.addRapportDetail = async (detailEntretienId, rapportId) => {
    try {
        const detailEntretien = await DetailEntretien.findById(detailEntretienId);
        if (!detailEntretien.rapports.includes(rapportId)) {
            detailEntretien.rapports.push(rapportId); 
        }
        await detailEntretien.save();
    } catch (error) {
        console.error('Error get Rdv:', error);
    }
};

exports.getHistoriquesEntretienByVehicule = async ({ 
    vehiculeId, 
    page = 1, 
    limit = 10, 
    typesEntretien = [],
    etats = [],
    dateMin = '',
    dateMax = '',
}) => {
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    try {
        const vehicule = await Vehicule.findById(vehiculeId)
            .populate({ path: 'modele', select: 'nom' });

        if (!vehicule) {
            return { error: "Véhicule non trouvé" };
        }

        const entretiens = await Entretien.find({ vehicule: vehiculeId });

        let query = { entretien: { $in: entretiens.map(e => e._id) } };

        if (etats.length > 0) {
            query['etat.code'] = { $in: etats };
        }

        if (typesEntretien.length > 0) {
            query.typeEntretien = { $in: typesEntretien.map(typeId => new mongoose.Types.ObjectId(typeId)) };
        }

        if (dateMin || dateMax) {
            query.$or = [];

            if (dateMin) {
                query.$or.push({ dateDebut: { $exists: true, $gte: new Date(dateMin) } });
            }
            if (dateMax) {
                query.$or.push({ dateFin: { $exists: true, $lte: new Date(dateMax) } });
            }

            if (dateMin && dateMax) {
                query.$and = [
                    { dateDebut: { $exists: true, $gte: new Date(dateMin) } },
                    { dateFin: { $exists: true, $lte: new Date(dateMax) } }
                ];
                delete query.$or;
            }
        }

        const totalItems = await DetailEntretien.countDocuments(query);

        let detailsEntretiens = await DetailEntretien.find(query)
            .populate({ path: 'entretien', select: 'date kilometrage' })
            .populate({ path: 'typeEntretien', select: 'nom description prix' })
            .populate({ path: 'users', select: 'nom' });

        detailsEntretiens.sort((a, b) => {
            const dateA = a.entretien?.date ? new Date(a.entretien.date) : new Date(0);
            const dateB = b.entretien?.date ? new Date(b.entretien.date) : new Date(0);
            return dateB - dateA; 
        });

        const paginatedDetails = detailsEntretiens.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        return {
            totalItems,
            vehicule: vehicule,
            details: paginatedDetails,
        };
    } catch (error) {
        console.error('Error get Historiques:', error);
        return { error: 'Erreur lors de la récupération des historiques' };
    }
};

exports.getEntretienByClientByDate = async (entretienId) => {
    try {
        const entretien = await Entretien.findById(entretienId);
        if (!entretien) throw new Error('Entretien introuvable');

        const vehicule = await Vehicule.findById(entretien.vehicule).select('proprietaire');
        if (!vehicule) throw new Error('Véhicule introuvable');

        const vehiculesClient = await Vehicule.find({
            proprietaire: vehicule.proprietaire
        }).select('_id');

        const startOfDay = new Date(entretien.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(entretien.date);
        endOfDay.setHours(23, 59, 59, 999);

        return await Entretien.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            vehicule: { $in: vehiculesClient.map(v => v._id) }
        }).select('_id');

    } catch (error) {
        console.error('Erreur lors de la récupération des entretiens :', error.message);
        throw new Error('Erreur lors de la récupération des entretiens.');
    }
};

exports.getEntretienActif = async (entretienIds) => {
    try {
        return await Entretien.find({
            _id: { $in: entretienIds },
            'etat.code': 0
        }).select('_id');
    } catch (error) {
        console.error('Error checking entretiens status:', error);
        throw error;
    }
};

exports.checkEntretienStatus = async (actifIds) => {
    try {
        const count = await DetailEntretien.countDocuments({
            entretien: { $in: actifIds },
            'etat.code': { $ne: 20 }
        });
        return count === 0;
    } catch (error) {
        console.error('Error checking entretiens status:', error);
        throw error;
    }
};

exports.getSumRapportPrice = async (detailEntretienId) => {
    try {
        if (!(detailEntretienId instanceof mongoose.Types.ObjectId)) {
            detailEntretienId = mongoose.Types.ObjectId(detailEntretienId);
        }

        const result = await DetailEntretien.aggregate([
            { $match: { _id: detailEntretienId } },
            { $lookup: {
                    from: 'rapports',
                    localField: 'rapports',
                    foreignField: '_id',
                    as: 'rapportDetails'
                }},
            { $unwind: { path: "$rapportDetails", preserveNullAndEmptyArrays: true } },
            { $group: {
                    _id: "$_id",
                    totalPrix: { $sum: { $ifNull: ["$rapportDetails.prix", 0] } }
                }}
        ]);

        return result.length > 0 ? result[0].totalPrix : 0;
    } catch (error) {
        console.error('Erreur lors de la récupération des prix des rapports:', error.message);
        throw new Error("Erreur lors de la récupération des prix des rapports.");
    }
};

exports.getSumEntretienPrice = async (detailEntretienId) => {
    try {
        // Vérification du type de detailEntretienId et conversion si nécessaire
        if (!(detailEntretienId instanceof mongoose.Types.ObjectId)) {
            detailEntretienId = mongoose.Types.ObjectId(detailEntretienId);
        }

        const result = await DetailEntretien.aggregate([
            { $match: { _id: detailEntretienId } },
            { $lookup: {
                    from: 'typeentretiens',  // Nom de la collection TypeEntretien (attention à la casse)
                    localField: 'typeEntretien',  // Assurez-vous que ce champ est correct
                    foreignField: '_id',  // Le champ clé dans la collection TypeEntretien
                    as: 'typeEntretienDetails'  // L'alias des résultats de la jointure
                }},
            { $unwind: { path: "$typeEntretienDetails", preserveNullAndEmptyArrays: true } },
            { $group: {
                    _id: "$_id",
                    totalPrix: { $sum: { $ifNull: ["$typeEntretienDetails.prix", 0] } }  // Utiliser le prix du TypeEntretien
                }}
        ]);

        return result.length > 0 ? result[0].totalPrix : 0;
    } catch (error) {
        console.error('Erreur lors de la récupération des prix des entretiens:', error.message);
        throw new Error("Erreur lors de la récupération des prix des entretiens.");
    }
};