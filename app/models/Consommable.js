const mongoose = require("mongoose");

const consommableSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    unite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unite'
    },
    prix: {
        type: Number,
        required: true,
        min: 0,
    },
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif
            libelle: { type: String, required: true }
        },
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("Consommable", consommableSchema);