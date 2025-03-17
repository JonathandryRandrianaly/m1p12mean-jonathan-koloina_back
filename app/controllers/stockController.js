const stockService = require('../services/stockService');

exports.createMouvementStock = async (req, res) => {
    const { date , dateDebut, consommableId, libelle, type, quantite} = req.body;
    try {
        const result = await stockService.createMouvementStock(date,dateDebut,consommableId,libelle,type,quantite);
        if(result===true){
            return res.status(201).json({success: true, message: 'Stock créé avec succès'});
        }else{
            return res.status(200).json({success: false, message: 'Mouvement impossible'});
        }
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};

exports.getHistoriqueMouvements = async (req, res) => {
    try {
        const params = req.query;
        const result = await stockService.getHistoriqueMouvements(params);
        res.json(result);
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send('Server error');
    }
};