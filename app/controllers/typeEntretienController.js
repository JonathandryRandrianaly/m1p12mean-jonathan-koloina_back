const TypeEntretien = require('../models/TypeEntretien');
const Specialisation = require('../models/Specialisation');

exports.createTypeEntretien= async (req, res) => {
    const { nom, description, categorie, specialisationsId, prix } = req.body;

    try {
        const existingTypeEntretien = await TypeEntretien.findOne({ nom, 'etat.code': 10 }); 
        if (existingTypeEntretien) {
            return res.status(400).json({ message: 'Type entretien existe déjà' });
        }
        const specialisations = await Specialisation.find({ _id: { $in: specialisationsId } }); 
        if (specialisations.length === 0) {
             return res.status(400).json({ message: 'Aucune specialisation correspondant trouvé.' });
        }
        const newTypeEntretien = new TypeEntretien({
            nom,
            description,
            categorie,
            specialisations: specialisations.map(spe => spe._id),
            prix,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newTypeEntretien.save();

        return res.status(201).json({ message: 'Type entretien créé avec succès'});
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
        const typeEntretiens = await TypeEntretien.find().populate('categorie').populate('specialisations');
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
        const typeEntretiens = await TypeEntretien.find({'etat.code': statut}).populate('categorie').populate('specialisations');
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