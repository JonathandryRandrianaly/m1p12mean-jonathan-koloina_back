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
