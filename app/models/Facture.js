const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    etat: {
        type: {
            code: { type: Number, required: true }, // 10: payé -10:non payé
            libelle: { type: String, required: true }
        },
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("Facture", factureSchema);