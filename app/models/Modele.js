const mongoose = require("mongoose");

const modeleSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    anneeFabrication: {
        type: Number,
        required: true
    },
    marque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marque'
    },
    energieMoteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnergieMoteur'
    },
    transmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transmission'
    },
    motricite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motricite'
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorieModele'
    },
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif
            libelle: { type: String, required: true }
        },
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("Modele", modeleSchema);