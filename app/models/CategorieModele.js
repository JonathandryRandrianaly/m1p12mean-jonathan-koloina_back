const mongoose = require("mongoose");

const categorieModeleSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif
            libelle: { type: String, required: true }
        },
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("CategorieModele", categorieModeleSchema);