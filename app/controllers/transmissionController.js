const Transmission = require('../models/Transmission');
const searchService = require('../services/searchService');

exports.createTransmission = async (req, res) => {
    const { nom } = req.body;

    try {
        const existingTransmission = await Transmission.findOne({ nom, 'etat.code': 10 }); 
        if (existingTransmission) {
            return res.status(400).json({ message: 'Transmission déjà existante' });
        }

        const newTransmission = new Transmission({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newTransmission.save();

        return res.status(201).json({ message: 'Transmission créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatTransmission = async (req, res) => {
    const { transmissionId } = req.params;

    try {
        const transmission = await Transmission.findById(transmissionId);
        if (!transmission) {
            return res.status(404).json({ message: 'Transmission non trouvée.' });
        }

        if (transmission.etat.code === -10) {
            transmission.etat = { code: 10, libelle: 'Actif' };
        } else {
            transmission.etat = { code: -10, libelle: 'Inactif' };
        }

        await transmission.save();

        return res.status(200).json({ message: 'État de la transmission mise à jour avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllTransmission = async (req, res) => {
    try {
        const transmissions = await Transmission.find();
        if (transmissions.length > 0) {
            return res.status(200).json(transmissions);
        } else {
            return res.status(404).json({ message: 'Aucune transmission trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllTransmissionByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const transmissions = await Transmission.find({'etat.code': statut});
        if (transmissions.length > 0) {
            return res.status(200).json(transmissions);
        } else {
            return res.status(404).json({ message: 'Aucune transmission trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchTransmissions = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,Transmission);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};