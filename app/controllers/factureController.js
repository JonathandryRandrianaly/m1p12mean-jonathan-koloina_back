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