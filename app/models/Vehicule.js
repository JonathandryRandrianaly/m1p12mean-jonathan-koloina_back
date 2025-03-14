const mongoose = require('mongoose');

const vehiculeSchema = new mongoose.Schema({
    modele: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Modele',
        required: true
    },
    immatriculation: {
        type: String,
        required: true,
        unique: true
    },
    proprietaire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Vehicule", vehiculeSchema);
