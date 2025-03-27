const Specialisation = require('../models/Specialisation');
const searchService = require('../services/searchService');

exports.createSpecialisation= async (req, res) => {
    const { nom } = req.body;

    try {
        const existingSpecialisation = await Specialisation.findOne({ nom, 'etat.code': 10 }); 
        if (existingSpecialisation) {
            return res.status(400).json({ message: 'Specialisation existe déjà' });
        }

        const newSpecialisation = new Specialisation({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newSpecialisation.save();

        return res.status(201).json({ message: 'Specialisation créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatSpecialisation = async (req, res) => {
    const { specialisationId } = req.params;

    try {
        const specialisation = await Specialisation.findById(specialisationId);
        if (!specialisation) {
            return res.status(404).json({ message: 'Specialisation non trouvée.' });
        }

        if (specialisation.etat.code === -10) {
            specialisation.etat = { code: 10, libelle: 'Actif' };
        } else {
            specialisation.etat = { code: -10, libelle: 'Inactif' };
        }

        await specialisation.save();

        return res.status(200).json({ message: 'État de specialisation mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllSpecialisation = async (req, res) => {
    try {
        const specialisations = await Specialisation.find();
        return res.status(200).json(specialisations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllSpecialisationByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const specialisations = await Specialisation.find({'etat.code': statut});
        return res.status(200).json(specialisations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchSpecialisations = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,Specialisation);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};