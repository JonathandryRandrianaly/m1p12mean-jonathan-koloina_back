const mongoose = require("mongoose");

const SpecialisationPersonnelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    specialisation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Specialisation'
    },
},{ timestamps: true })

module.exports = mongoose.model("SpecialisationPersonnel", SpecialisationPersonnelSchema);