const entretienService = require("../services/entretienService");
const User = require("../models/User");
const Role = require("../models/Role");

exports.enregistrerDemandeService= async (req, res) => {
    const { date, vehiculeId, typeEntretiens } = req.body;

    try {
        const entretienId = await entretienService.createEntretien(date,vehiculeId);
        for (let typeEntretien of typeEntretiens) {
            await entretienService.createDetailEntretien(entretienId,typeEntretien);
        }
        return res.status(201).json({message: "Demande enregistré"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getOrdreMecaniciens= async (req, res) => {
    const { detailEntretienId } = req.params;

    try {
        const mecaniciens = await entretienService.getOrdreMecaniciens(detailEntretienId);
        return res.status(200).json(mecaniciens);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.assignerMecano= async (req, res) => {
    const { detailEntretienId, usersId } = req.body;

    try {
        entretienService.assignerMecano(detailEntretienId, usersId);
        return res.status(201).json({ message: 'Assignation effectuée' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getEntretienByMonth= async (req, res) => {
    const { month } = req.params;

    try {
        const entretiens = await entretienService.getEntretienMonth(month);
        return res.status(200).json(entretiens);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getEntretienDetailByDate= async (req, res) => {
    const { date } = req.params;
    try {
        const entretiens = await entretienService.getEntretienDetailByDate(date);
        return res.status(200).json(entretiens);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getDetailEntretienById= async (req, res) => {
    const { detailEntretienId } = req.params;
    try {
        const detailEntretien = await entretienService.getDetailEntretienById(detailEntretienId);
        return res.status(200).json(detailEntretien);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.updateStatusDetail = async (req, res) => {
    const { detailEntretienId, etatCode, etatLibelle } = req.body;
    try {
        const entretiens = await entretienService.updateStatusDetail(detailEntretienId,etatCode,etatLibelle);
        return res.status(200).json({
            message: 'Status changed successfully',
            detailEntretienId: entretiens
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};