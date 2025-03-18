const User = require('../models/User');
const mongoose = require('mongoose');

exports.searchUsers = async ({ page = 1, limit = 10, sortedColumn = '', sortDirection = 'asc', roles = [],etats = [], nom = '' }) => {
    const defaultSortedColumn = sortedColumn || 'nom';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};
    if (nom) {
        query.nom = { $regex: nom, $options: 'i' };
    }
    if (roles.length > 0) {
        query.roles = { $in: roles.map(roleId => new mongoose.Types.ObjectId(roleId)) };
    }
    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };
    }

    const totalItems = await User.countDocuments(query);
    let users = await User.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('roles');

    users = users.sort((a, b) => {
        if (defaultSortedColumn === 'roles') {
            const roleA = a.roles.map(role => role.libelle).join(', ').toLowerCase();
            const roleB = b.roles.map(role => role.libelle).join(', ').toLowerCase();
            return roleA.localeCompare(roleB) * sortOrder;
        } else {
            const aValue = a[defaultSortedColumn] || '';
            const bValue = b[defaultSortedColumn] || '';
            return aValue.localeCompare(bValue) * sortOrder;
        }
    });

    return { totalItems, items: users };
};

