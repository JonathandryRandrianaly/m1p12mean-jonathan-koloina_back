const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
