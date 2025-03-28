const SpecialisationPersonnel = require('../models/SpecialisationPersonnel');
const Specialisation = require('../models/Specialisation');

exports.createSpecialisationPersonnel= async (req, res) => {
    const { user, specialisation } = req.body;

    try {
        const existingSpecialisation = await Specialisation.findOne({ specialisation, 'etat.code': 10 }); 
        if (existingSpecialisation) {
            return res.status(400).json({ message: 'Specialisation existe déjà' });
        }

        const newSP = new SpecialisationPersonnel({
            user,
            specialisation
        });

        await newSP.save();

        return res.status(201).json({ message: 'Specialisation Personnel créée avec succès'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updatepecialisationPersonnel = async (req, res) => {
    const { user, specialisations } = req.body;
    try {
        await SpecialisationPersonnel.deleteMany({ user });
        for (let specialisation of specialisations) {
            const newSP = new SpecialisationPersonnel({
                user,
                specialisation
            });
            await newSP.save();
        }
        return res.status(201).json({ message: 'Les spécialisations de l\'utilisateur ont été mises à jour avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getAllSpecialisationByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const spes = await SpecialisationPersonnel.find({user: userId}).populate('specialisation');
        return res.status(200).json(spes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};