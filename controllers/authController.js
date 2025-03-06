const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const Role = require('../models/Role');
const jwt = require("jsonwebtoken");

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

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('roles');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const roles = user.roles.map(role => role.libelle);
        const token = jwt.sign(
            { userId: user._id, roles }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        res.json({ token });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
    
};

exports.testToken = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide ou expiré' });
        }

        const { userId, roles } = decoded;

        res.json({
            message: 'Token validé et décodé avec succès',
            userId,
            roles
        });
    });
};
