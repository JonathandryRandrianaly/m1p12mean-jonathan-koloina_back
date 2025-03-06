const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const Role = require('../models/Role');

exports.inscription = async (req, res) => {
    const { email, password, nom, dateNaissance, telephone, roleLibelles } = req.body; 

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles = await Role.find({ libelle: { $in: roleLibelles } }); 
        if (roles.length === 0) {
             return res.status(400).json({ message: 'Aucun rôle correspondant trouvé.' });
        }
        const newUser = new User({
            email,
            password: hashedPassword, 
            nom,
            dateNaissance,
            telephone,
            roles: roles.map(role => role._id) 
        });
        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};
