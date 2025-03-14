const Unite = require('../models/Unite');
const searchService = require('../services/searchService');

exports.createUnite= async (req, res) => {
    const { nom } = req.body;

    try {
        const existingUnite = await Unite.findOne({ nom, 'etat.code': 10 }); 
        if (existingUnite) {
            return res.status(400).json({ message: 'Unite existe déjà' });
        }

        const newUnite = new Unite({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newUnite.save();

        return res.status(201).json({ message: 'Unité créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatUnite = async (req, res) => {
    const { uniteId } = req.params;

    try {
        const unite = await Unite.findById(uniteId);
        if (!unite) {
            return res.status(404).json({ message: 'Unité non trouvée.' });
        }

        if (unite.etat.code === -10) {
            unite.etat = { code: 10, libelle: 'Actif' };
        } else {
            unite.etat = { code: -10, libelle: 'Inactif' };
        }

        await unite.save();

        return res.status(200).json({ message: 'État de unite mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUnite = async (req, res) => {
    try {
        const unites = await Unite.find();
        if (unites.length > 0) {
            return res.status(200).json(unites);
        } else {
            return res.status(404).json({ message: 'Aucune unité trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllUniteByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const unites = await Unite.find({'etat.code': statut});
        if (unites.length > 0) {
            return res.status(200).json(unites);
        } else {
            return res.status(404).json({ message: 'Aucune unite trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchUnites = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,Unite);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};