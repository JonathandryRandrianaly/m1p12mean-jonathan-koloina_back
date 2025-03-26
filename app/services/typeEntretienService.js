const mongoose = require('mongoose');
const TypeEntretien = require('../models/TypeEntretien');

exports.getTypeEntretienByCategorieService = async (categorieEntretienId,categorieModeleId) => {
    try {
        const result = await TypeEntretien.find({
            categorieEntretien: categorieEntretienId,
            categorieModele: categorieModeleId,
            'etat.code': 10
        })
            .populate('categorieEntretien')
            .populate('categorieModele')
            .populate('specialisations');

        return result;
    } catch (error) {
        console.log(error);
        throw new Error("Impossible de récupérer les types d'entretien");
    }
};