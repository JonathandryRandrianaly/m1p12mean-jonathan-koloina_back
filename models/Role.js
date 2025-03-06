const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    libelle: {
        type: String,
        required: true
    },
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif
            libelle: { type: String, required: true }
        },
        required: true,
        default: { code: 10, libelle: 'Actif' } 
    }
}, { timestamps: true });

module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);
