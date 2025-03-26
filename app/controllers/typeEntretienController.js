const TypeEntretien = require('../models/TypeEntretien');
const Specialisation = require('../models/Specialisation');
const searchService = require('../services/searchService');
const typeEntretienService = require('../services/typeEntretienService');

exports.createTypeEntretien= async (req, res) => {
    const { nom, description, categorieEntretien,categorieModele, specialisationsId, prix } = req.body;

    try {
        const existingTypeEntretien = await TypeEntretien.findOne({ nom, categorieModele}); 
        if (existingTypeEntretien) {
            return res.json({ success: false, message: 'Type entretien existe déjà' });
        }        
        const specialisations = await Specialisation.find({ _id: { $in: specialisationsId } }); 
        if (specialisations.length === 0) {
             return res.status(400).json({ message: 'Aucune specialisation correspondant trouvé.' });
        }
        const newTypeEntretien = new TypeEntretien({
            nom,
            description,
            categorieEntretien,
            categorieModele,
            specialisations: specialisations.map(spe => spe._id),
            prix,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newTypeEntretien.save();

        return res.status(201).json({success: true, message: 'Type entretien créé avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatTypeEntretien = async (req, res) => {
    const { typeEntretienId } = req.params;

    try {
        const typeEntretien = await TypeEntretien.findById(typeEntretienId);
        if (!typeEntretien) {
            return res.status(404).json({ message: 'TypeEntretien non trouvée.' });
        }

        if (typeEntretien.etat.code === -10) {
            typeEntretien.etat = { code: 10, libelle: 'Actif' };
        } else {
            typeEntretien.etat = { code: -10, libelle: 'Inactif' };
        }

        await typeEntretien.save();

        return res.status(200).json({ message: 'État de typeEntretien mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllTypeEntretien = async (req, res) => {
    try {
        const typeEntretiens = await TypeEntretien.find().populate('categorieEntretien').populate('categorieModele').populate('specialisations');
        if (typeEntretiens.length > 0) {
            return res.status(200).json(typeEntretiens);
        } else {
            return res.status(404).json({ message: 'Aucun type trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllTypeEntretienByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const typeEntretiens = await TypeEntretien.find({'etat.code': statut}).populate('categorieEntretien').populate('categorieModele').populate('specialisations');
        if (typeEntretiens.length > 0) {
            return res.status(200).json(typeEntretiens);
        } else {
            return res.status(404).json({ message: 'Aucun type entretien trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchTypesEntretien = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchTypesEntretien(searchParams);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};

exports.updateTypeEntretien= async (req, res) => {
    const { typeId , specialisationsId, description, prix } = req.body;

    try {
        const type = await TypeEntretien.findById(typeId);  
        const specialisations = await Specialisation.find({ _id: { $in: specialisationsId } }); 
        type.specialisations = [];
        type.specialisations= specialisations.map(spe => spe._id);
        type.description= description;
        type.prix= prix;

        await type.save();

        return res.status(201).json({success: true, message: 'Specialisations modifiés avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getTypeEntretienByCategorie = async (req, res) => {
    try {
        const { categorieId, categorieModeleId } = req.query;
        const result = await typeEntretienService.getTypeEntretienByCategorieService(categorieId,categorieModeleId);
        res.json(result);
    } catch (error) {
        console.error('Error during getTypeEntretienByCategorie:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};