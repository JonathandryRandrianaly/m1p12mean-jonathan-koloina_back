const EnergieMoteur = require('../models/EnergieMoteur');

exports.createEnergieMoteur = async (req, res) => {
    const { nom } = req.body;

    try {
        const existingEM = await EnergieMoteur.findOne({ nom, 'etat.code': 10 }); 
        if (existingEM) {
            return res.status(400).json({ message: 'Energie moteur déjà existant' });
        }

        const newEM = new EnergieMoteur({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newEM.save();

        return res.status(201).json({ message: 'Energie moteur créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatEnergieMoteur = async (req, res) => {
    const { energieMoteurId } = req.params;

    try {
        const energieMoteur = await EnergieMoteur.findById(energieMoteurId);
        if (!energieMoteur) {
            return res.status(404).json({ message: 'Energie moteur non trouvée.' });
        }

        if (energieMoteur.etat.code === -10) {
            energieMoteur.etat = { code: 10, libelle: 'Actif' };
        } else {
            energieMoteur.etat = { code: -10, libelle: 'Inactif' };
        }

        await energieMoteur.save();

        return res.status(200).json({ message: 'État de energie moteur mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllEnergieMoteur = async (req, res) => {
    try {
        const energieMoteurs = await EnergieMoteur.find();
        if (energieMoteurs.length > 0) {
            return res.status(200).json(energieMoteurs);
        } else {
            return res.status(404).json({ message: 'Aucune energie moteur trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllEnergieMoteurByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const energieMoteurs = await EnergieMoteur.find({'etat.code': statut});
        if (energieMoteurs.length > 0) {
            return res.status(200).json(energieMoteurs);
        } else {
            return res.status(404).json({ message: 'Aucune energie moteur trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};