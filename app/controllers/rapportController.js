const rapportService = require('../services/rapportService');
const entretienService = require('../services/entretienService');

exports.createRapport = async (req, res) => {
    try {
        const { detailEntretienId, libelle, prix } = req.body;
        const files = req.files;
        const rapportId = await rapportService.createRapport(libelle, prix, files);
        entretienService.addRapportDetail(detailEntretienId,rapportId);
        res.status(201).json({ message: "Rapport créé avec succès", rapportId });
    } catch (error) {
        console.error('Erreur lors de la création du rapport:', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};
