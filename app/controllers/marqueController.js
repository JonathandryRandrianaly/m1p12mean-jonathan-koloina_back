const Marque = require('../models/Marque');
const searchService = require('../services/searchService');

exports.createMarque = async (req, res) => {
    const { nom } = req.body;

    try {
        const existingMarque = await Marque.findOne({ nom, 'etat.code': 10 }); 
        if (existingMarque) {
            return res.status(400).json({ message: 'La marque existe déjà' });
        }

        const newMarque = new Marque({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newMarque.save();

        return res.status(201).json({ message: 'Marque créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatMarque = async (req, res) => {
    const { marqueId } = req.params;

    try {
        const marque = await Marque.findById(marqueId);
        if (!marque) {
            return res.status(404).json({ message: 'Marque non trouvée.' });
        }

        if (marque.etat.code === -10) {
            marque.etat = { code: 10, libelle: 'Actif' };
        } else {
            marque.etat = { code: -10, libelle: 'Inactif' };
        }

        await marque.save();

        return res.status(200).json({ message: 'État de la marque mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllMarque = async (req, res) => {
    try {
        const marques = await Marque.find();
        return res.status(200).json(marques);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllMarqueByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const marques = await Marque.find({'etat.code': statut});
        return res.status(200).json(marques);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchMarques = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,Marque);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};