const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    consommable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consommable',
        required: true
    },
    libelle: {
        type: String,
        required: true
    },
    entree: {
        type: Number,
        required: true
    },
    sortie: {
        type: Number,
        required: true
    },
    prix: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true })

module.exports = mongoose.model("Stock", stockSchema);