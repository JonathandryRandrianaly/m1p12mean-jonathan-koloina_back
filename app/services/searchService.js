const mongoose = require('mongoose');
const Consommable = require('../models/Consommable');

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
                const roleA = a.unite?.nom.toLowerCase();
                const roleB = b.unite?.nom.toLowerCase();
                return roleA.localeCompare(roleB) * sortOrder;
            } else {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                return aValue.localeCompare(bValue) * sortOrder;
            }

    });

    return { totalItems, items: consommables };
};