const factureService = require("../services/factureService");
const Facture = require("../models/Facture");

exports.checkFacture= async (req, res) => {
    const { entretienId } = req.params;

    try {
        await factureService.checkFacture(entretienId);
        return res.status(201).json({message: "Check enregistré"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.assignEntretienToFacture= async (req, res) => {
    const { factureId, entretienId } = req.body;

    try {
        await factureService.assignEntretienToFacture(factureId, entretienId);
        return res.status(201).json({message: "Entretien assigné"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchFacture = async (req, res) => {
    const searchParams = req.query;
    try {
        const factures = await factureService.searchFactures(searchParams);
        return res.status(200).json(factures);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getFullDetails= async (req, res) => {
    const { factureId } = req.params;

    try {
        const factures = await factureService.getFullDetailFactureByFacture(factureId);
        return res.status(200).json(factures);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getFullFacture = async (req, res) => {
    const { factureId } = req.params;

    try {
        const factures = await Facture.findById(factureId).populate({
            path: 'client',
        })
        return res.status(200).json(factures);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};