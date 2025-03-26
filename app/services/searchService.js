const mongoose = require('mongoose');
const Consommable = require('../models/Consommable');
const Modele = require('../models/Modele');
const TypeEntretien = require('../models/TypeEntretien');
const Vehicule = require('../models/Vehicule');

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
            }
            else if (defaultSortedColumn === 'prix') { 
                const aValue = parseFloat(a[defaultSortedColumn]) || 0;
                const bValue = parseFloat(b[defaultSortedColumn]) || 0;
                return (aValue - bValue) * sortOrder;
            } 
            else {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                return aValue.localeCompare(bValue) * sortOrder;
            }

    });

    return { totalItems, items: consommables };
};

exports.searchModeles = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = [], marques= [], energies= [], transmissions= [], motricites= [], categories= [], anneeMin= '', anneeMax='' }) => {
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

    if(categories.length >0){
        query.categorie = { $in: categories.map(categorieId => new mongoose.Types.ObjectId(categorieId)) };
    }
    
    const totalItems = await Modele.countDocuments(query);
    let modeles = await Modele.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('marque')
        .populate('energieMoteur')
        .populate('transmission')
        .populate('motricite')
        .populate('categorie');

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

exports.searchTypesEntretien = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = [], categoriesEntretien= [], categoriesModele= [], specialisations= [], prixMin= '', prixMax='' }) => {
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

    if(categoriesEntretien.length >0){
        query.categorieEntretien = { $in: categoriesEntretien.map(categorieEntretienId => new mongoose.Types.ObjectId(categorieEntretienId)) };
    }

    if(categoriesModele.length >0){
        query.categorieModele = { $in: categoriesModele.map(categorieModeleId => new mongoose.Types.ObjectId(categorieModeleId)) };
    }

    if(specialisations.length >0){
        query.specialisations = { $in: specialisations.map(specialisationId => new mongoose.Types.ObjectId(specialisationId)) };
    }

    if (prixMin || prixMax) {
        query.prix = {};
        if (prixMin) query.prix.$gte = parseInt(prixMin, 10);
        if (prixMax) query.prix.$lte = parseInt(prixMax, 10);
    }

    const totalItems = await TypeEntretien.countDocuments(query);
    let types = await TypeEntretien.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('categorieEntretien')
        .populate('categorieModele')
        .populate('specialisations');

        const getValue = (obj, path) => {
            return path.split('.').reduce((o, key) => o?.[key] || '', obj);
        };
    

        types = types.sort((a, b) => {
            if (defaultSortedColumn === 'nom') {
                const aValue = a[defaultSortedColumn] || '';
                const bValue = b[defaultSortedColumn] || '';
                return aValue.localeCompare(bValue) * sortOrder;
            } 
            else if (defaultSortedColumn === 'prix') { 
                const aValue = parseFloat(a[defaultSortedColumn]) || 0;
                const bValue = parseFloat(b[defaultSortedColumn]) || 0;
                return (aValue - bValue) * sortOrder;
            } 
            else if (defaultSortedColumn === 'specialisation') {
                const aValue = a.specialisations.map(spe => spe.nom).join(', ').toLowerCase();
                const bValue = b.specialisations.map(spe => spe.nom).join(', ').toLowerCase();
                return aValue.localeCompare(bValue) * sortOrder;
            } 
            else {
                const aValue = getValue(a, defaultSortedColumn).toString().toLowerCase();
                const bValue = getValue(b, defaultSortedColumn).toString().toLowerCase();
                return aValue.localeCompare(bValue) * sortOrder;
            }            
    });

    return { totalItems, items: types };
};

exports.searchVehicules = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', immatriculation = '', proprietaire= '', proprietaireId='', etats = [], modeles= []}) => {
    const defaultSortedColumn = sortedColumn || 'immatriculation';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let matchQuery = {};

    if (immatriculation) {
        matchQuery.immatriculation = { $regex: immatriculation, $options: 'i' };
    }

    if (etats.length > 0) {
        matchQuery["etat.code"] = { $in: etats.map(code => Number(code)) };  
    }

    if (modeles.length > 0) {
        matchQuery.modele = { $in: modeles.map(modeleId => new mongoose.Types.ObjectId(modeleId)) };
    }

    if(proprietaireId){
        matchQuery.proprietaire = new mongoose.Types.ObjectId(proprietaireId);
    }

    const aggregationPipeline = [
        { $match: matchQuery },

        { 
            $lookup: {
                from: "users", 
                localField: "proprietaire",
                foreignField: "_id",
                as: "proprietaire"
            }
        },
        { $unwind: { path: "$proprietaire", preserveNullAndEmptyArrays: true } },

        { 
            $lookup: {
                from: "modeles", 
                localField: "modele",
                foreignField: "_id",
                as: "modele"
            }
        },
        { $unwind: { path: "$modele", preserveNullAndEmptyArrays: true } }
    ];

    if (proprietaire) {
        aggregationPipeline.push({
            $match: { "proprietaire.nom": { $regex: proprietaire, $options: "i" } }
        });
    }

    const totalItems = await Vehicule.aggregate([...aggregationPipeline, { $count: "total" }]);
    const total = totalItems.length > 0 ? totalItems[0].total : 0;

    aggregationPipeline.push(
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize }
    );

    let vehicules = await Vehicule.aggregate(aggregationPipeline);

    vehicules = vehicules.sort((a, b) => {
        if (defaultSortedColumn === 'immatriculation') {
            const aValue = a[defaultSortedColumn] || '';
            const bValue = b[defaultSortedColumn] || '';
            return aValue.localeCompare(bValue) * sortOrder;
        } else if (defaultSortedColumn === 'modele'){
            const aValue = a.modele?.nom.toLowerCase();
            const bValue = b.modele?.nom.toLowerCase();
            return aValue.localeCompare(bValue) * sortOrder;
        } else{
            const aValue = a.proprietaire?.nom.toLowerCase();
            const bValue = b.proprietaire?.nom.toLowerCase();
            return aValue.localeCompare(bValue) * sortOrder;
        }
    });

    return { totalItems: total, items: vehicules };
};
