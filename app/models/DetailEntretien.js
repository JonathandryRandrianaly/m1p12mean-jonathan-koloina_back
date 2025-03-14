const mongoose = require('mongoose');

const detailEntretienSchema = new mongoose.Schema({
    typeEntretien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeEntretien'
    },
    etat: {
        type: {
            code: { type: Number, required: true }, // -10:a faire, 0 en cours, 10: attente de validation, 20: valider
            libelle: { type: String, required: true }
        },
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("DetailEntretien", detailEntretienSchema);
