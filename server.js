const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const roleRoute = require('./app/routes/roleRoute');
const authRoute = require('./app/routes/authRoute');
const marqueRoute = require('./app/routes/marqueRoute');

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log("MongoDB connecté"))
 .catch(err => console.log(err));

// Routes
const prefix = '/api';
app.use(prefix, roleRoute);
app.use(prefix, authRoute);
app.use(prefix, marqueRoute);
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
