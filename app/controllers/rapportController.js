const rapportService = require('../services/rapportService');
const entretienService = require('../services/entretienService');

exports.createRapport = async (req, res) => {
    try {
        const { detailEntretienId, libelle, prix } = req.body;
        const justificatifs = req.files;
        const rapportId = await rapportService.createRapport(libelle, prix, justificatifs);
        if(rapportId != null){
            entretienService.addRapportDetail(detailEntretienId,rapportId);
        }
        res.status(201).json({ success: true});
    } catch (error) {
        console.error('Erreur lors de la création du rapport:', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};
