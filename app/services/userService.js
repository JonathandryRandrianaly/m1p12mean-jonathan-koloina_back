const User = require('../models/User');
const mongoose = require('mongoose');

exports.searchUsers = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', roles = [], etats = [], nom = '' }) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let matchQuery = {};
    if (nom) {
        matchQuery.nom = { $regex: nom, $options: 'i' };
    }
    if (roles.length > 0) {
        matchQuery.roles = { $in: roles.map(roleId => new mongoose.Types.ObjectId(roleId)) };
    }
    if (etats.length > 0) {
        matchQuery['etat.code'] = { $in: etats };
    }

    const aggregationPipeline = [
        { $match: matchQuery },

        { 
            $lookup: {
                from: "roles", 
                localField: "roles",
                foreignField: "_id",
                as: "roles"
            }
        },

        { 
            $addFields: {
                roleLibelle: { $ifNull: [{ $arrayElemAt: ["$roles.libelle", 0] }, ""] }
            }
        },

        { $sort: { [defaultSortedColumn === 'roles' ? 'roleLibelle' : defaultSortedColumn]: sortOrder } },

        { $facet: {
            totalItems: [{ $count: "count" }],
            items: [
                { $skip: (pageNumber - 1) * pageSize },
                { $limit: pageSize }
            ]
        }}
    ];

    const result = await User.aggregate(aggregationPipeline);
    
    const totalItems = result[0].totalItems.length > 0 ? result[0].totalItems[0].count : 0;
    const users = result[0].items;

    return { totalItems, items: users };
};

