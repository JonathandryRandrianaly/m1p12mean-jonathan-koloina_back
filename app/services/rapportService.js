const Rapport = require('../models/Rapport');
const multer = require("multer");
const path = require("path");
const DetailEntretien = require('../models/DetailEntretien');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        "text/plain"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non supporté"), false);
    }
};

const upload = multer({ storage, fileFilter });

exports.createRapport = async (libelle, prix, justificatifs) => {
    try {
        let fichiers = []; 

        if (justificatifs && justificatifs.length > 0) {
            fichiers = justificatifs.map(file => ({
                filename: file.filename,
                path: `/uploads/${file.filename}`,
                contentType: file.mimetype,
                size: file.size
            }));
        }

        const rapportData = { libelle };

        if (prix !== null && prix !== undefined && prix !== "" && !isNaN(Number(prix))) {
            rapportData.prix = Number(prix); 
        }

        if (fichiers.length > 0) {
            rapportData.justificatifs = fichiers;
        }

        const newRapport = new Rapport(rapportData);
        await newRapport.save();

        return newRapport._id;

    } catch (error) {
        console.error('Error adding upload:', error);
    }
};

exports.removeJustificatifsRapport = async (rapportId, fileId) => {
    try {
       await Rapport.updateOne(
            { _id: rapportId },
            { $pull: { justificatifs: { _id: fileId } } }
        );
    } catch (error) {
        console.error('Error remove justificatifs:', error);
    }
};

exports.removeRapport = async (rapportId) => {
    try {
        await Rapport.deleteOne({ _id: rapportId });
        await DetailEntretien.updateMany(
            { rapports: rapportId },  
            { $pull: { rapports: rapportId } } 
        );
    } catch (error) {
        console.error('Error remove rapport:', error);
    }
};

exports.addJustificatifs = async (rapportId, justificatifs) => {
    try {
        if (!justificatifs || justificatifs.length === 0) {
            throw new Error("Aucun justificatif fourni");
        }

        const fichiers = justificatifs.map(file => ({
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            contentType: file.mimetype,
            size: file.size
        }));

        await Rapport.updateOne(
            { _id: rapportId },
            { $push: { justificatifs: { $each: fichiers } } }
        );

    } catch (error) {
        console.error('Error adding justificatifs:', error);
    }
};



exports.upload = upload;
