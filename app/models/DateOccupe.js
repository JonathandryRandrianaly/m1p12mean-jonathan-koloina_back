const mongoose = require('mongoose');

const dateOccupeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("DateOccupe", dateOccupeSchema);
