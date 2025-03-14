const mongoose = require("mongoose");

const entretienSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: true
    },
    kilometrage: {
        type: Number,
        required: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Entretien", entretienSchema);