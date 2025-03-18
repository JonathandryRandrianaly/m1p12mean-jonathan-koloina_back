const Entretien = require("../models/Entretien");
const DetailEntretien = require("../models/DetailEntretien");
const User = require("../models/User");
const SpecialisationPersonnel = require("../models/SpecialisationPersonnel");
const mongoose = require('mongoose');

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

        const entretiensEnCours = await DetailEntretien.find()
            .populate({
                path: "entretien",
                match: { 
                    date: { 
                        $eq: new Date(detailEntretien.entretien.date)
                    }
                }
            })
            .populate("users");
    
        const specialisationPromises = mecaniciens.map(mecanicien =>
            SpecialisationPersonnel.find({ user: mecanicien._id })
        );

        const specialisationsResult = await Promise.all(specialisationPromises);

        let ordreMecaniciens = mecaniciens.map((mecanicien, index) => {
            const userId = mecanicien._id.toString();
            const spes = specialisationsResult[index];
            const correspondanceCount = spes
                ? spes.filter(spec => specialisationIds.includes(spec.specialisation.toString())).length
                : 0;
            const estOccupe = entretiensEnCours.some(entretien =>
                entretien.users.some(user => user._id.toString() === userId)
            );

            return {
                user: mecanicien,
                correspondanceCount,
                estOccupe
            };
        });

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
        const detailEntretien= await DetailEntretien.findById(detailEntretienId);
        detailEntretien.users = usersId;
        detailEntretien.dateDebut = detailEntretien.entretien.dateDebut;
        detailEntretien.etat = { code: 0, libelle: 'En cours' };
        await detailEntretien.save();
    } catch (error) {
        console.error(error);
    }
};