const CategorieEntretien = require('../models/CategorieEntretien');
const TypeEntretien = require('../models/TypeEntretien');
const searchService = require('../services/searchService');
const mongoose = require("mongoose");

exports.createCategorieEntretien = async (req, res) => {
    const { nom, icone, description } = req.body;

    try {
        const existingCE = await CategorieEntretien.findOne({ nom, 'etat.code': 10 }); 
        if (existingCE) {
            return res.status(400).json({ message: 'La catégorie existe déjà' });
        }

        const newCE = new CategorieEntretien({
            nom,
            icone,
            description,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newCE.save();

        return res.status(201).json({ message: 'Categorie créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatCategorieEntretien = async (req, res) => {
    const { categorieEntretienId } = req.params;

    try {
        const categorieEntretien = await CategorieEntretien.findById(categorieEntretienId);
        if (!categorieEntretien) {
            return res.status(404).json({ message: 'Categorie non trouvée.' });
        }

        if (categorieEntretien.etat.code === -10) {
            categorieEntretien.etat = { code: 10, libelle: 'Actif' };
        } else {
            categorieEntretien.etat = { code: -10, libelle: 'Inactif' };
        }

        await categorieEntretien.save();

        return res.status(200).json({ message: 'État de la categorie mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllCategorieEntretien = async (req, res) => {
    try {
        const categories = await CategorieEntretien.find();
        if (categories.length > 0) {
            return res.status(200).json(categories);
        } else {
            return res.status(404).json({ message: 'Aucune categorie trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllCategorieEntretienByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const categorieEntretiens = await CategorieEntretien.find({'etat.code': statut});
        if (categorieEntretiens.length > 0) {
            return res.status(200).json(categorieEntretiens);
        } else {
            return res.status(404).json({ message: 'Aucune categorie trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllCategorieEntretienByStatutWithMinPrice = async (req, res) => {
    const { statut } = req.params;
    const { categorieModeleId } = req.query;
    try {
        const categorieEntretiens = await CategorieEntretien.find({'etat.code': statut}).lean();

        if (categorieEntretiens.length > 0) {
            for (let categorie of categorieEntretiens) {
                const filter = { categorieEntretien: categorie._id };

                if (categorieModeleId) {
                    filter.categorieModele = new mongoose.Types.ObjectId(categorieModeleId._id);
                }

                const prixMin = await TypeEntretien.find(filter)
                    .sort({ prix: 1 })
                    .limit(1)
                    .select('prix');

                categorie.prixMinimum = prixMin.length > 0 ? prixMin[0].prix : 0;
            }
            return res.status(200).json(categorieEntretiens);
        } else {
            return res.status(404).json({ message: 'Aucune catégorie trouvée.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchCategorieEntretiens = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,CategorieEntretien);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};
