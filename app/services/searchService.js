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
        .sort({ [defaultSortedColumn]: sortOrder })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

    return { totalItems, items: models };
};

exports.searchRoles = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', nom = '',etats = []}, model) => {
    const defaultSortedColumn = sortedColumn || 'libelle';
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
        .sort({ [defaultSortedColumn]: sortOrder })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

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
    let consommables;
    
    if (defaultSortedColumn === 'unite') {
        consommables = await Consommable.aggregate([
            { $match: query },
            { 
                $lookup: { 
                    from: "unites", 
                    localField: "unite", 
                    foreignField: "_id", 
                    as: "unite"
                } 
            },
            { $unwind: { path: "$unite", preserveNullAndEmptyArrays: true } },
            { $sort: { "unite.nom": sortOrder } }, 
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ]);
    } else {
        consommables = await Consommable.find(query)
            .populate('unite') 
            .sort({ [defaultSortedColumn]: sortOrder })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
    }

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
    let modeles;
    
    if (['marque.nom', 'energieMoteur.nom', 'transmission.nom', 'motricite.nom', 'categorie.nom'].includes(defaultSortedColumn)) {
        modeles = await Modele.aggregate([
            { $match: query },
            { $lookup: { from: "marques", localField: "marque", foreignField: "_id", as: "marque" } },
            { $lookup: { from: "energies", localField: "energieMoteur", foreignField: "_id", as: "energieMoteur" } },
            { $lookup: { from: "transmissions", localField: "transmission", foreignField: "_id", as: "transmission" } },
            { $lookup: { from: "motricites", localField: "motricite", foreignField: "_id", as: "motricite" } },
            { $lookup: { from: "categories", localField: "categorie", foreignField: "_id", as: "categorie" } },
            { $unwind: { path: "$marque", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$energieMoteur", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$transmission", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$motricite", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$categorie", preserveNullAndEmptyArrays: true } },
            { $sort: { [defaultSortedColumn]: sortOrder } }, 
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ]);
    } else {
        modeles = await Modele.find(query)
            .populate('marque')
            .populate('energieMoteur')
            .populate('transmission')
            .populate('motricite')
            .populate('categorie')
            .sort({ [defaultSortedColumn]: sortOrder }) 
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
    }

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
    let types;

    if (['categorieEntretien.nom', 'categorieModele.nom', 'specialisations.nom'].includes(defaultSortedColumn)) {
        types = await TypeEntretien.aggregate([
            { $match: query },
            { $lookup: { from: "categoriesEntretien", localField: "categorieEntretien", foreignField: "_id", as: "categorieEntretien" } },
            { $lookup: { from: "categoriesModele", localField: "categorieModele", foreignField: "_id", as: "categorieModele" } },
            { $lookup: { from: "specialisations", localField: "specialisations", foreignField: "_id", as: "specialisations" } },
            { $unwind: { path: "$categorieEntretien", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$categorieModele", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$specialisations", preserveNullAndEmptyArrays: true } },
            { $addFields: { "specialisationNom": { $ifNull: ["$specialisations.nom", ""] } } },
            { $sort: { [defaultSortedColumn]: sortOrder } },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ]);
    } else {
        types = await TypeEntretien.find(query)
            .populate('categorieEntretien')
            .populate('categorieModele')
            .populate('specialisations')
            .sort({ [defaultSortedColumn]: sortOrder })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);
    }

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

    let sortQuery = {};
    if (defaultSortedColumn === 'modele') {
        sortQuery['modele.nom'] = sortOrder;
    } else if (defaultSortedColumn === 'proprietaire') {
        sortQuery['proprietaire.nom'] = sortOrder;
    } else {
        sortQuery[defaultSortedColumn] = sortOrder;
    }

    aggregationPipeline.push(
        { $sort: sortQuery }, 
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize }
    );

    let vehicules = await Vehicule.aggregate(aggregationPipeline);

    return { totalItems: total, items: vehicules };
};
