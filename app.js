const express = require('express');//Importation d'express
require('dotenv').config();
const mongoose = require('mongoose'); // Importation Mogoose
const path = require('path');

const sauceRoutes = require('./routes/sauce'); // Importation de notre router pour sauce
const userRoutes = require('./routes/user'); // Importation de notre router pour user

const app = express(); // Création de notre application express

//Connection API à la base de données MongoDB
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PWD}@cluster0.qcjcriv.mongodb.net/test?retryWrites=true&w=majority`, 
{ useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json()); // Accès au corps de la requête - Mise à disposition du content type Json sur la requête dans req.body

app.use((req, res, next) => { // Gérer CORS Accès de l'application à l'API = Middelware général appliqué à toutes les routes de notre serveur
    res.setHeader('Access-Control-Allow-Origin', '*');// Origine tout le monde
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');// Authorisation pour les entêtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //Authorisation pour les méthodes
    next(); // Passage de l'execution au middleware suivant
  });

  const bodyParser = require('body-parser');
// Enregistrement des routes pour le frontend
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  app.use('/images', express.static(path.join(__dirname, 'images'))); 

module.exports = app; // Exportation de l'application - accès depuis les autres fichiers ( notamment server Node)