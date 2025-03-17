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
