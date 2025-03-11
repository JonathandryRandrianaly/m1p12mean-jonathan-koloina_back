const Motricite = require('../models/Motricite');

exports.createMotricite= async (req, res) => {
    const { nom } = req.body;

    try {
        const existingMotricite = await Motricite.findOne({ nom, 'etat.code': 10 }); 
        if (existingMotricite) {
            return res.status(400).json({ message: 'Motricite existe déjà' });
        }

        const newMotricite = new Motricite({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newMotricite.save();

        return res.status(201).json({ message: 'Motricite créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatMotricite = async (req, res) => {
    const { motriciteId } = req.params;

    try {
        const motricite = await Motricite.findById(motriciteId);
        if (!motricite) {
            return res.status(404).json({ message: 'Motricite non trouvée.' });
        }

        if (motricite.etat.code === -10) {
            motricite.etat = { code: 10, libelle: 'Actif' };
        } else {
            motricite.etat = { code: -10, libelle: 'Inactif' };
        }

        await motricite.save();

        return res.status(200).json({ message: 'État de motricite mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllMotricite = async (req, res) => {
    try {
        const motricites = await Motricite.find();
        if (motricites.length > 0) {
            return res.status(200).json(motricites);
        } else {
            return res.status(404).json({ message: 'Aucune motricite trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllMotriciteByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const motricites = await Motricite.find({'etat.code': statut});
        if (motricites.length > 0) {
            return res.status(200).json(motricites);
        } else {
            return res.status(404).json({ message: 'Aucune motricite trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};