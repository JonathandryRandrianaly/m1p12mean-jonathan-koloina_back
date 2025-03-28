const CategorieModele = require('../models/CategorieModele');
const searchService = require('../services/searchService');

exports.createCategorieModele = async (req, res) => {
    const { nom } = req.body;

    try {
        const existingCM = await CategorieModele.findOne({ nom, 'etat.code': 10 }); 
        if (existingCM) {
            return res.status(400).json({ message: 'La catégorie existe déjà' });
        }

        const newCM = new CategorieModele({
            nom,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newCM.save();

        return res.status(201).json({ message: 'Categorie créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatCategorieModele = async (req, res) => {
    const { categorieModeleId } = req.params;

    try {
        const categorieModele = await CategorieModele.findById(categorieModeleId);
        if (!categorieModele) {
            return res.status(404).json({ message: 'Categorie non trouvée.' });
        }

        if (categorieModele.etat.code === -10) {
            categorieModele.etat = { code: 10, libelle: 'Actif' };
        } else {
            categorieModele.etat = { code: -10, libelle: 'Inactif' };
        }

        await categorieModele.save();

        return res.status(200).json({ message: 'État de la categorie mise à jour avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllCategorieModele = async (req, res) => {
    try {
        const categories = await CategorieModele.find();
        return res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllCategorieModeleByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const categorieModeles = await CategorieModele.find({'etat.code': statut});
        return res.status(200).json(categorieModeles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.searchCategorieModeles = async (req, res) => {
    try {
        const searchParams = req.query;
        const result = await searchService.searchModels(searchParams,CategorieModele);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};
