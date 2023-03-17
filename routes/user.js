
const express = require ('express');// Importation express
const router = express.Router(); // Création avec méthode router d'express
const userCtrl = require('../controllers/user');// Importation Ctrl pour associer les fonctions aux différentes routes

/* Création des routes Inscription et Connexion de l'API avec les middlewares
 et les controllers d'authentification et de sécurité qui leur sont appliquées*/

//Chiffre le mot de passe de l'utilisateur, ajoute l'utilisateur à la base de données
router.post('/signup', userCtrl.signup); // Création d'un nouvel utilisateur

/*Vérifie les informations d'identification de l'utilisateur, 
renvoi l'identifiant userID depuis la base de données et un TokenWeb JSON signé(contenant également l'identifiant userID)*/
router.post('/login', userCtrl.login); //Connexion de l'utilisateur

module.exports = router; // Exportation du router - accès depuis les autres fichiers 