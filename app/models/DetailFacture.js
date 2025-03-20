const mongoose = require("mongoose");

const detailFactureSchema = new mongoose.Schema({
    facture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facture'
    },
    entretien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entretien',
        unique: true
    },
    prix: {
        type: Number,
        required: true
    }
},{ timestamps: true })

module.exports = mongoose.model("DetailFacture", detailFactureSchema);