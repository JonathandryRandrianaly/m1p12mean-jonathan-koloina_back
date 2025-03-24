const DateOccupe = require('../models/DateOccupe');

exports.getDateOccupe = async (req, res) => {
    try {
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        const dateDisabled = await DateOccupe.find({
            date: { $gte: todayMidnight }
        });

        return res.status(200).json({ dateDisabled });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur du serveur" });
    }
};

exports.isDateOccupe = async (req, res) => {
    try {
        const { date } = req.params;
        if (!date) {
            return res.status(400).json({ message: "Date requise" });
        }
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);

        const dateDisabled = await DateOccupe.findOne({
            date: {
                $gte: dateToCheck,
                $lt: new Date(dateToCheck.getTime() + 86400000)
            }
        });

        return res.status(200).json(!!dateDisabled);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur du serveur" });
    }
};

exports.setDate = async (req, res) => {
    const { date } = req.params;
    try {
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);

        const existingDate = await DateOccupe.findOne({
            date: {
                $gte: dateToCheck,
                $lt: new Date(dateToCheck.getTime() + 86400000)
            }
        });

        if (existingDate) {
            await existingDate.deleteOne();
            return res.status(200).json({ message: "Date marquée comme libre", isFree: true });
        } else {
            const newDO = new DateOccupe({ date: dateToCheck });
            await newDO.save();
            return res.status(201).json({ message: "Date marquée comme occupée", isFree: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur du serveur" });
    }
};