const Stock = require('../models/Stock');
const mongoose = require('mongoose');
const Consommable = require('../models/Consommable');

async function getResteStock(consommableId, dateDebut) {
    try {
        const resultat = await Stock.aggregate([
            {
                $match: {
                    consommable: new mongoose.Types.ObjectId(consommableId),
                    date: { $gte: new Date(dateDebut) } 
                }
            },
            {
                $group: {
                    _id: '$consommable',
                    totalEntree: { $sum: '$entree' },
                    totalSortie: { $sum: '$sortie' }
                }
            },
            {
                $project: {
                    _id: 0,
                    consommable: '$_id',
                    stockActuel: { $subtract: ['$totalEntree', '$totalSortie'] }
                }
            }
        ]);

        if (resultat.length > 0) {
            return resultat[0].stockActuel;
        } else {
            return 0; 
        }
    } catch (error) {
        console.error('Erreur lors du calcul du stock :', error);
        return error;
    }
}


exports.createMouvementStock= async (date, dateDebut, consommableId, libelle, type, quantite ) => {

    try {
        if(type==='entree'){
            entree= quantite;
            sortie= 0;
        }else{
            const stock= await getResteStock(consommableId, dateDebut);
           //console.log('stock '+stock);
            if(stock>=quantite){
                entree=0;
                sortie = quantite;
            }else{
                return false;
            } 
        }
        const consommable = await Consommable.findById(consommableId);
        const stock = new Stock({
            date,
            consommable: consommableId, 
            libelle,
            entree,
            sortie,
            prix: consommable.prix
        });
        await stock.save();

        return {result: true, id: stock._id};
    } catch (error) {
        console.error(error);
        return error;
    }
};

exports.getHistoriqueMouvements = async ({ page = 1, limit = 10, consommableId, dateMin = '', dateMax = '' }) => {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    let query = {};
    query.consommable = new mongoose.Types.ObjectId(consommableId);
    if (dateMin || dateMax) {
        query.date = {};  
        if (dateMin) {
            query.date.$gte = new Date(dateMin); 
        }
        if (dateMax) {
            query.date.$lte = new Date(dateMax);
        }
    }

    const mouvements = await Stock.find(query)
        .populate({
            path: 'consommable',
            populate: { path: 'unite' }
        })
        .sort({ date: 1 });
    
    let stockActuel = 0; 
    const mouvementsAvecStock = mouvements.map(mouvement => {
        stockActuel += mouvement.entree || 0;  
        stockActuel -= mouvement.sortie || 0;
        
        return {
            ...mouvement.toObject(),
            stockActuel: stockActuel
        };
    });

    const totalItems = mouvements.length;
    const itemsToReturn = mouvementsAvecStock.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return { totalItems, items: itemsToReturn };
};



