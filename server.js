const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const roleRoute = require('./routes/roleRoute');
const authRoute = require('./routes/authRoute');

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log("MongoDB connecté"))
 .catch(err => console.log(err));

// Routes
app.use('/garage', roleRoute);
app.use('/garage', authRoute);
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
