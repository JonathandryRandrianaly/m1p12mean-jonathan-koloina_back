const mongoose = require('mongoose');

const rapportSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: false,
        min: 0,
    },
    justificatifs: [{
        filename: String,  
        path: String,  
        contentType: String,  
        size: Number,  
    }]
}, { timestamps: true });

module.exports = mongoose.model("Rapport", rapportSchema);
