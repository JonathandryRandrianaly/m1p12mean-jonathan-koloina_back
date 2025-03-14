const mongoose = require("mongoose");

const typeEntretienSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categorieEntretien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorieEntretien'
    },
    categorieModele: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorieModele'
    },
    prix: {
        type: Number,
        required: true,
        min: 0,
    },
    specialisations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Specialisation'
        }
    ],
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif
            libelle: { type: String, required: true }
        },
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("TypeEntretien", typeEntretienSchema);