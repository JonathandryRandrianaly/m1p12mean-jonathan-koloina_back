const factureService = require("../services/factureService");

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