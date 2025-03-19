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
        const detailEntretien= await DetailEntretien.findById(detailEntretienId).populate('entretien').populate('typeEntretien').populate('users');
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