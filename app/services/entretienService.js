const Entretien = require("../models/Entretien");
const DetailEntretien = require("../models/DetailEntretien");

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