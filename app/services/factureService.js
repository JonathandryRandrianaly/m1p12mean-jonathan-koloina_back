const Facture = require("../models/Facture");
const Entretien = require("../models/Entretien");
const DetailEntretien = require("../models/DetailEntretien");
const DetailFacture = require("../models/DetailFacture");
const entretienService = require("./entretienService");
const mongoose = require("mongoose");

exports.checkFacture = async (entretienId) => {
    try {
        const entretienIdByClientDate = await entretienService.getEntretienByClientByDate(entretienId);

        const entretienIds = entretienIdByClientDate.map(entretien => entretien._id);

        const entretienActifIds = await entretienService.getEntretienActif(entretienIds);

        const actifIds = entretienActifIds.map(entretien => entretien._id);

        const isFacturable = await entretienService.checkEntretienStatus(actifIds);

        if (isFacturable) {

            const entretienDateModel = await Entretien.findById(entretienId).select('date');

            const entretienDate = entretienDateModel.date;

            const factureId = await this.createFacture(entretienDate);
            for (let entretien of actifIds) {
                await this.assignEntretienToFacture(factureId, entretien);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de la facture :", error.message);
        throw new Error("Erreur du serveur");
    }
};

exports.createFacture = async (date) => {
    try {
        const newFacture = new Facture({
            date: date,
            etat: { code: -10, libelle: 'Non payé' }
        });
        await newFacture.save();
        return newFacture._id;
    } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création de la facture.");
    }
};

exports.createDetailFacture = async (factureId, entretienId, prix) => {
    try {
        const newDetail = new DetailFacture({
            facture: factureId,
            entretien: entretienId,
            prix: prix
        });
        await newDetail.save();
    } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création du détail de la facture.");
    }
};

exports.assignEntretienToFacture = async (factureId, entretienId) => {
    try {
        const result = await DetailFacture.aggregate([
            { $match: { entretien: entretienId } },
            { $group: { _id: null, totalPrix: { $sum: "$prix" } } }
        ]);

        let prixTotal = result.length > 0 ? result[0].totalPrix : 0;

        const detailEntretiens = await DetailEntretien.find({ entretien: entretienId }).select('_id');

        for (let detailEntretien of detailEntretiens) {
            const rapportPrix = await entretienService.getSumRapportPrice(detailEntretien._id);
            prixTotal += rapportPrix;
        }

        await this.createDetailFacture(factureId, entretienId, prixTotal);
    } catch (error) {
        console.error("Erreur lors de l'attribution de l'entretien à la facture :", error.message);
        throw new Error("Erreur lors de l'attribution de l'entretien à la facture.");
    }
};
