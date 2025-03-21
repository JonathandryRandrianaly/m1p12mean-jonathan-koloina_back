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

exports.createDetailFacture = async (factureId, detailEntretienId, prix) => {
    try {
        const newDetail = new DetailFacture({
            facture: factureId,
            detailEntretien: detailEntretienId,
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
        const detailEntretiens = await entretienService.getDetailEntretienByEntretien(entretienId);

        for (let detailEntretien of detailEntretiens) {
            await this.createDetailFacture(factureId, detailEntretien._id, detailEntretien.typeEntretien.prix);
        }

    } catch (error) {
        console.error("Erreur lors de l'attribution de l'entretien à la facture :", error.message);
        throw new Error("Erreur lors de l'attribution de l'entretien à la facture.");
    }
};
