const Consommable = require('../models/Consommable');

exports.createConsommable= async (req, res) => {
    const { nom, unite } = req.body;

    try {
        const existingConsommable = await Consommable.findOne({ nom, 'etat.code': 10 }); 
        if (existingConsommable) {
            return res.status(400).json({ message: 'Consommable existe déjà' });
        }

        const newConsommable = new Consommable({
            nom,
            unite,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newConsommable.save();

        return res.status(201).json({ message: 'Consommable créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatConsommable = async (req, res) => {
    const { consommableId } = req.params;

    try {
        const consommable = await Consommable.findById(consommableId);
        if (!consommable) {
            return res.status(404).json({ message: 'Consommable non trouvée.' });
        }

        if (consommable.etat.code === -10) {
            consommable.etat = { code: 10, libelle: 'Actif' };
        } else {
            consommable.etat = { code: -10, libelle: 'Inactif' };
        }

        await consommable.save();

        return res.status(200).json({ message: 'État de consommable mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllConsommable = async (req, res) => {
    try {
        const consommables = await Consommable.find().populate('unite');
        if (consommables.length > 0) {
            return res.status(200).json(consommables);
        } else {
            return res.status(404).json({ message: 'Aucun consommable trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllConsommableByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const consommables = await Consommable.find({'etat.code': statut}).populate('unite');
        if (consommables.length > 0) {
            return res.status(200).json(consommables);
        } else {
            return res.status(404).json({ message: 'Aucun consommable trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};