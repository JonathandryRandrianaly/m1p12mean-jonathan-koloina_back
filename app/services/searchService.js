const mongoose = require('mongoose');
const Consommable = require('../models/Consommable');
const Modele = require('../models/Modele');

exports.searchModels = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = []}, model) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};
    if (nom) {
        query.nom = { $regex: nom, $options: 'i' };
    }

    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };  
    }
    const totalItems = await model.countDocuments(query);
    let models = await model.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

        models = models.sort((a, b) => {
        const aValue = a[defaultSortedColumn] || '';
        const bValue = b[defaultSortedColumn] || '';
        return aValue.localeCompare(bValue) * sortOrder;
    });

    return { totalItems, items: models };
};

exports.searchRoles = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = []}, model) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};
    if (nom) {
        query.libelle = { $regex: nom, $options: 'i' };
    }

    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };  
    }
    const totalItems = await model.countDocuments(query);
    let models = await model.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

        models = models.sort((a, b) => {
        const aValue = a[defaultSortedColumn] || '';
        const bValue = b[defaultSortedColumn] || '';
        return aValue.localeCompare(bValue) * sortOrder;
    });

    return { totalItems, items: models };
};

exports.searchConsommables = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = [], unites= []}) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};
    if (nom) {
        query.nom = { $regex: nom, $options: 'i' };
    }

    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };  
    }

    if(unites.length >0){
        query.unite = { $in: unites.map(uniteId => new mongoose.Types.ObjectId(uniteId)) };
    }
    const totalItems = await Consommable.countDocuments(query);
    let consommables = await Consommable.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('unite');

        consommables = consommables.sort((a, b) => {
            if (defaultSortedColumn === 'unite') {
                const uniteA = a.unite?.nom.toLowerCase();
                const uniteB = b.unite?.nom.toLowerCase();
                return uniteA.localeCompare(uniteB) * sortOrder;
            } else {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                return aValue.localeCompare(bValue) * sortOrder;
            }

    });

    return { totalItems, items: consommables };
};

exports.searchModeles = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = [], marques= [], energies= [], transmissions= [], motricites= [], anneeMin= '', anneeMax=''}) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};
    if (nom) {
        query.nom = { $regex: nom, $options: 'i' };
    }

    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };  
    }

    if(marques.length >0){
        query.marque = { $in: marques.map(marqueId => new mongoose.Types.ObjectId(marqueId)) };
    }

    if(energies.length >0){
        query.energieMoteur = { $in: energies.map(energieId => new mongoose.Types.ObjectId(energieId)) };
    }

    if(transmissions.length >0){
        query.transmission = { $in: transmissions.map(transmissionId => new mongoose.Types.ObjectId(transmissionId)) };
    }

    if(motricites.length >0){
        query.motricite = { $in: motricites.map(motriciteId => new mongoose.Types.ObjectId(motriciteId)) };
    }

    if (anneeMin || anneeMax) {
        query.anneeFabrication = {};
        if (anneeMin) query.anneeFabrication.$gte = parseInt(anneeMin, 10);
        if (anneeMax) query.anneeFabrication.$lte = parseInt(anneeMax, 10);
    }
    
    const totalItems = await Modele.countDocuments(query);
    let modeles = await Modele.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('marque')
        .populate('energieMoteur')
        .populate('transmission')
        .populate('motricite');

        const getValue = (obj, path) => {
            return path.split('.').reduce((o, key) => o?.[key] || '', obj);
        };
    

        modeles = modeles.sort((a, b) => {
            if (defaultSortedColumn === 'nom') {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                return aValue.localeCompare(bValue) * sortOrder;
            }
             else {
                const aValue = getValue(a, defaultSortedColumn).toString().toLowerCase();
                const bValue = getValue(b, defaultSortedColumn).toString().toLowerCase();
                return aValue.localeCompare(bValue) * sortOrder;
            }

    });

    return { totalItems, items: modeles };
};