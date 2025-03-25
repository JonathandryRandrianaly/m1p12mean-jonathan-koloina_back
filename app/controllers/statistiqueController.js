const statistiqueService = require('../services/statistiqueService');

exports.getNombrePersonnel = async (req, res) => {
    try {
        const result = await statistiqueService.getNombrePersonnel();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Server error');
    }
};

exports.getNombreClient = async (req, res) => {
    try {
        const result = await statistiqueService.getNombreClient();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Server error');
    }
};

exports.getNombreTotalRdv = async (req, res) => {
    try {
        const result = await statistiqueService.getNombreTotalRdv();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Server error');
    }
};

exports.getNombreMoyenRdv = async (req, res) => {
    try {
        const {type} =req.query
        const result = await statistiqueService.getNombreMoyenRdv(type);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Server error');
    }
};