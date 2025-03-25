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