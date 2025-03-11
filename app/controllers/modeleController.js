const Modele = require('../models/Modele');

exports.createModele = async (req, res) => {
    const { nom, anneeFabrication, marque, energieMoteur, transmission } = req.body;

    try {
        const existingModele = await Modele.findOne({ nom, 'etat.code': 10 }); 
        if (existingModele) {
            return res.status(400).json({ message: 'Le modèle existe déjà' });
        }

        const newModele = new Modele({
            nom,
            anneeFabrication,
            marque,
            energieMoteur,
            transmission,
            etat: { code: 10, libelle: 'Actif' } 
        });

        await newModele.save();

        return res.status(201).json({ message: 'Modèle créé avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllModele = async (req, res) => {
    try {
        const modeles = await Modele.find().populate('marque').populate('energieMoteur').populate('transmission');
        if (modeles.length > 0) {
            return res.status(200).json(modeles);
        } else {
            return res.status(404).json({ message: 'Aucun modèle trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateEtatModele = async (req, res) => {
    const { modeleId } = req.params;

    try {
        const modele = await Modele.findById(modeleId);
        if (!modele) {
            return res.status(404).json({ message: 'Modele non trouvé.' });
        }

        if (modele.etat.code === -10) {
            modele.etat = { code: 10, libelle: 'Actif' };
        } else {
            modele.etat = { code: -10, libelle: 'Inactif' };
        }

        await modele.save();

        return res.status(200).json({ message: 'État du modele mise à jour avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllModeleByStatut = async (req, res) => {
    const { statut } = req.params;
    try {
        const modeles = await Modele.find({'etat.code': statut}).populate('marque').populate('energieMoteur').populate('transmission');
        if (modeles.length > 0) {
            return res.status(200).json(modeles);
        } else {
            return res.status(404).json({ message: 'Aucun modele trouvé.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};