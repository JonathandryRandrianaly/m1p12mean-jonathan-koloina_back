const Vehicule = require('../models/Vehicule');
const searchService = require('../services/searchService');

exports.createVehicule= async (req, res) => {
    const { modele, immatriculation, proprietaire } = req.body;
    try {
        const existingVehicule = await Vehicule.findOne({ immatriculation , 'etat.code': 10 }); 
        if (existingVehicule) {
            return res.status(400).json({ message: 'Vehicule existe déjà' });
        }

        const newVehicule = new Vehicule({
            modele,
            immatriculation,
            proprietaire,
            etat: { code: 10, libelle: 'Actif' } 
        });
        await newVehicule.save();
        return res.status(201).json({success: true, message: 'Vehicule créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatVehicule = async (req, res) => {
    const { vehiculeId } = req.params;

    try {
        const vehicule = await Vehicule.findById(vehiculeId);
        if (!vehicule) {
            return res.status(404).json({ message: 'vehicule non trouvé.' });
        }

        if (vehicule.etat.code === -10) {
            vehicule.etat = { code: 10, libelle: 'Actif' };
        } else {
            vehicule.etat = { code: -10, libelle: 'Inactif' };
        }

        await vehicule.save();

        return res.status(200).json({ message: 'État de vehicule mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllVehiculeByProprio = async (req, res) => {
    const { proprietaire } = req.params;
    try {
        const vehicules = await Vehicule.find({ proprietaire , 'etat.code': 10 })
        .populate([
            { path: 'modele', populate: { path: 'marque' } },
            { path: 'modele', populate: { path: 'categorie' } }
        ])        
        .populate('proprietaire');
        return res.status(200).json(vehicules);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllVehicule = async (req, res) => {
    try {
        const vehicules = await Vehicule.find().populate('modele').populate('proprietaire');
        return res.status(200).json(vehicules);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchVehicules = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchVehicules(searchParams);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};