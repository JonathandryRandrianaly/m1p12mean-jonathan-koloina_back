const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    nom: {
        type: String,
        required: true
    },
    dateNaissance: {
        type: Date,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    genre:{
        type: {
            idGenre: { type: Number, required: true }, // 0: homme 1: femme
            libelle: { type: String, required: true }
        },
        required: true,
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }
    ],
    etat: { 
        type: {
            code: { type: Number, required: true }, // 10: actif -10:inactif 0:créé
            libelle: { type: String, required: true }
        },
        required: true,
        default: { code: 10, libelle: 'Actif' } 
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
