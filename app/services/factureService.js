const Facture = require("../models/Facture");
const Entretien = require("../models/Entretien");
const DetailEntretien = require("../models/DetailEntretien");
const DetailFacture = require("../models/DetailFacture");
const entretienService = require("./entretienService");
const mongoose = require("mongoose");

exports.checkFacture = async (entretienId) => {
    try {
        const entretienIdByClientDate = await entretienService.getEntretienByClientByDate(entretienId);

        const entretienIds = entretienIdByClientDate.map(entretien => entretien._id);

        const entretienActifIds = await entretienService.getEntretienActif(entretienIds);

        const actifIds = entretienActifIds.map(entretien => entretien._id);

        const isFacturable = await entretienService.checkEntretienStatus(actifIds);

        if (isFacturable) {

            const entretienModel = await Entretien.findById(entretienId)
                .populate({
                    path: "vehicule",
                    select: "proprietaire",
                });

            const entretienDate = entretienModel.date;
            const entretienClient = entretienModel.vehicule.proprietaire;

            const factureId = await this.createFacture(entretienDate,entretienClient);
            for (let entretien of actifIds) {
                await this.assignEntretienToFacture(factureId, entretien);
            }
            const prix = await this.getMontantFacture(factureId);
            await this.setPrixFacture(factureId, prix);
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de la facture :", error.message);
        throw new Error("Erreur du serveur");
    }
};

exports.createFacture = async (date,userId) => {
    try {
        const newFacture = new Facture({
            date: date,
            client: userId,
            etat: { code: -10, libelle: 'Non payé' }
        });
        await newFacture.save();
        return newFacture._id;
    } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création de la facture.");
    }
};

exports.createDetailFacture = async (factureId, detailEntretienId, prix) => {
    try {
        const newDetail = new DetailFacture({
            facture: factureId,
            detailEntretien: detailEntretienId,
            prix: prix
        });
        await newDetail.save();
    } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création du détail de la facture.");
    }
};

exports.assignEntretienToFacture = async (factureId, entretienId) => {
    try {
        const detailEntretiens = await entretienService.getDetailEntretienByEntretien(entretienId);

        for (let detailEntretien of detailEntretiens) {
            await this.createDetailFacture(factureId, detailEntretien._id, detailEntretien.typeEntretien.prix);
        }

    } catch (error) {
        console.error("Erreur lors de l'attribution de l'entretien à la facture :", error.message);
        throw new Error("Erreur lors de l'attribution de l'entretien à la facture.");
    }
};

exports.searchFactures = async ({
                                    page = 1,
                                    limit = 10,
                                    sortedColumn = 'date',
                                    sortDirection = 'desc',
                                    id = '',
                                    client = '',
                                    date = '',
                                    etats = []
                                }) => {
    const defaultSortedColumn = sortedColumn || 'date';
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const sortOrder = sortDirection === 'desc' ? -1 : 1;

    let query = {};

    if (id) {
        query._id = { $regex: id, $options: 'i' };
    }

    if (client) {
        query.client = new mongoose.Types.ObjectId(client);
    }

    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        query.date = { $gte: startDate, $lte: endDate };
    }

    if (etats.length > 0) {
        query['etat.code'] = { $in: etats };
    }

    const totalItems = await Facture.countDocuments(query);

    let factures = await Facture.find(query)
        .sort({ [defaultSortedColumn]: sortOrder })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);

    // for (let facture of factures) {
    //     facture.montantTotal = await this.getMontantFacture(facture._id);
    // }

    return { totalItems, items: factures };
};

exports.getDetailFactureByFacture = async (factureId) => {
    try {
        return await DetailFacture.find({ facture: factureId }).lean();
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de facture :', error.message);
        throw new Error('Erreur lors de la récupération des détails de facture.');
    }
};

exports.getMontantFacture = async (factureId) => {
    try {
        let prixTotal = 0;
        const detailFactures = await this.getDetailFactureByFacture(factureId);

        const prixPromises = detailFactures.map(async (detailFacture) => {
            const rapportPrice = await entretienService.getSumRapportPrice(detailFacture.detailEntretien);
            const entretienPrice = await entretienService.getSumEntretienPrice(detailFacture.detailEntretien);
            return rapportPrice + entretienPrice;
        });

        const prixResults = await Promise.all(prixPromises);
        prixTotal = prixResults.reduce((sum, value) => sum + value, 0);
        return prixTotal;
    } catch (error) {
        console.error('Erreur lors du calcul du montant total de la facture :', error.message);
        throw new Error('Erreur lors du calcul du montant total de la facture.');
    }
};

exports.getFullDetailFactureByFacture = async (factureId) => {
    try {
        return await DetailFacture.find({ facture: factureId })
            .populate({
                path: 'detailEntretien',
                populate: [
                    {
                        path: 'entretien',
                        populate: {
                            path: 'vehicule',
                            populate: {
                                path: 'proprietaire',
                            }
                        }
                    },
                    { path: 'typeEntretien' },
                    { path: 'rapports' }
                ]
            });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de facture :', error.message);
        throw new Error('Erreur lors de la récupération des détails de facture.');
    }
};

exports.updateEtatPaiement = async (factureId, etatCode, etatLibelle) => {
    try {
        const existingFacture = await Facture.findById(factureId);
        if (!existingFacture) {
            return res.status(404).json({ message: 'Facture non trouvé' });
        }

        existingFacture.etat = {
            code: etatCode,
            libelle: etatLibelle
        };
        await existingFacture.save();
        return existingFacture._id;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.setPrixFacture = async (factureId, prix) => {
    try {
        const existingFacture = await Facture.findById(factureId);
        if (!existingFacture) {
            return res.status(404).json({ message: 'Facture non trouvé' });
        }

        existingFacture.prix = prix;
        await existingFacture.save();
        return existingFacture._id;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

exports.getEvoCA = async (type, detailType) => {
    try {
        let matchCondition = {};
        let groupByField = null;
        type = Number(type);
        detailType = Number(detailType);
        if (type === 0) {
            groupByField = { year: { $year: "$date" } };
        }
        if (type === 1 && detailType) {
            matchCondition = {
                date: {
                    $gte: new Date(`${detailType}-01-01T00:00:00.000Z`),
                    $lt: new Date(`${detailType + 1}-01-01T00:00:00.000Z`)
                }
            };
            groupByField = { month: { $month: "$date" }, year: { $year: "$date" } };
        }

        if (!groupByField) {
            throw new Error("Type invalide");
        }

        const aggregationPipeline = [
            { $match: matchCondition },
            {
                $group: {
                    _id: groupByField,
                    total: { $sum: "$prix" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ];

        const results = await Facture.aggregate(aggregationPipeline);

        return results.map(item => ({
            periode: type === 0 ? item._id.year : item._id.month,
            chiffreAffaires: item.total
        }));
    } catch (error) {
        console.error(error);
        return { message: 'Erreur du serveur' };
    }
};

exports.getFactureImpayee = async () => {
    try {
        const result = await Facture.aggregate([
            { $match: { 'etat.code': -10 } },
            { $group: { _id: null, total: { $sum: '$prix' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des factures impayées');
    }
};

exports.getFacturePayee = async () => {
    try {
        const result = await Facture.aggregate([
            { $match: { 'etat.code': 10 } },
            { $group: { _id: null, total: { $sum: '$prix' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des factures payées');
    }
};

exports.getFactureTotal = async () => {
    try {
        const result = await Facture.aggregate([
            { $group: { _id: null, total: { $sum: '$prix' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des factures');
    }
};