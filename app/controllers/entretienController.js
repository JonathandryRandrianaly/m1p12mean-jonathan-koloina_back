const entretienService = require("../services/entretienService");

exports.enregistrerDemandeService= async (req, res) => {
    const { date, vehiculeId, typeEntretiens } = req.body;

    try {
        const entretienId = await entretienService.createEntretien(date,vehiculeId);
        for (let typeEntretien of typeEntretiens) {
            await entretienService.createDetailEntretien(entretienId,typeEntretien);
        }
        return res.status(201).json({message: "Demande enregistré"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getOrdreMecaniciens= async (req, res) => {
    const { detailEntretienId } = req.params;

    try {
        const mecaniciens = await entretienService.getOrdreMecaniciens(detailEntretienId);
        return res.status(200).json(mecaniciens);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.assignerMecano= async (req, res) => {
    const { detailEntretienId, usersId } = req.body;

    try {
        entretienService.assignerMecano(detailEntretienId, usersId);
        return res.status(201).json({ message: 'Assignation effectuée' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};
