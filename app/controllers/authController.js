const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const Role = require('../models/Role');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const SpecialisationPersonnel = require("../models/SpecialisationPersonnel");

exports.inscription = async (req, res) => {
    const { email, password, nom, dateNaissance, telephone, idGenre, roleLibelles } = req.body; 

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
        if(idGenre === 0){
            genre= 'Homme';
        }else{
            genre= 'Femme';
        }
        const newUser = new User({
            email,
            password: hashedPassword, 
            nom,
            dateNaissance,
            telephone,
            genre : {idGenre : idGenre, libelle: genre},
            roles: roles.map(role => role._id),
            etat: { code: 10, libelle: 'Actif' } 
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
        const user = await User.findOne({ email, 'etat.code': 10  }).populate('roles');

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

exports.decodeToken = async (req, res) => {
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

exports.addEmployes = async (req, res) => {
    const { lien, email, nom, dateNaissance, telephone,idGenre, roleLibelles } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        const roles = await Role.find({ libelle: { $in: roleLibelles } }); 
        if (roles.length === 0) {
             return res.status(400).json({ message: 'Aucun rôle correspondant trouvé.' });
        }
        if(idGenre === '0'){
            genre= 'Homme';
        }else{
            genre= 'Femme';
        }
        const newUser = new User({
            email, 
            nom,
            dateNaissance,
            telephone,
            genre : {idGenre : idGenre, libelle: genre},
            roles: roles.map(role => role._id),
            etat: { code: 0, libelle: 'En attente' }
        });
        await newUser.save();
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );
        this.envoyerMailMdp(token, email, lien);
        res.status(201).json({
            message: "Employé créé avec succès" ,
            userId: newUser._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.resendInvit = async (req, res) => {
    const { userId, lien } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );
        this.envoyerMailMdp(token, user.email, lien);
        res.status(201).json({
            message: "Invitation envoyer"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

exports.envoyerMailMdp = async (token, email, lien) => {
    const objet= 'Invitation à définir votre mot de passe';
    const resetLink = `${lien}?token=${token}`;
    const contenu = `
        <p>Bonjour,</p>
        <p>Vous avez été autorisé à définir votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir votre mot de passe :</p>
        <p><a href="${resetLink}" target="_blank" style="color: blue; text-decoration: underline;">Définir mon mot de passe</a></p>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Cordialement,</p>
        <p>Votre équipe</p>
    `;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email, 
            subject: objet, 
            html: contenu
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error);
    }
};


exports.checkValiditeLien = async (req, res) => {
    const { token } = req.query; 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }        
        if(user.etat.code === 0){
            return res.status(200).json({
                message: 'Lien valide',
                user: user
            });
        }else{
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Lien invalide ou expiré.' });
    }
};

exports.updatePassword = async (req, res) => {
    const { userId , password} = req.body;
    try{
        const user = await User.findById(userId);
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password= hashedPassword;
        user.etat = { code: 10, libelle: 'Actif' } ;
        await user.save();
        return res.status(200).json({ message: 'Mot de passe enregistré avec succès'});
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
}

exports.updateRoleUsers = async (req, res) => {
    const { userId, roles } = req.body;
    try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const validRoles = await Role.find({ '_id': { $in: roles } });
        if (validRoles.length !== roles.length) {
            return res.status(400).json({ message: 'Certains rôles sont invalides' });
        }
        existingUser.roles = validRoles.map(role => role._id);
        await existingUser.save();
        return res.status(200).json({
            message: 'Les rôles de l\'utilisateur ont été mis à jour avec succès.',
            user: existingUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};