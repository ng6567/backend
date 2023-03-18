const bcrypt = require('bcrypt');// Importation du package de cryptage
const jwt = require('jsonwebtoken'); // Importation du package pour token d'authentification

const User = require('../models/User'); //Importation du modèle user

// Exportation fonction enregistrement de nouveaux utilisateurs
exports.signup = ((req, res, next) =>{ // hachage du mot de passe (fonction asynchrone longue) avant enregistrement BD 
    if(!req.body.password.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)){
        return res.status(400).json({message : 'Votre mot de passe doit contenir XXX'})
    }
 bcrypt.hash(req.body.password, 10)//Déclaration fonction param corps de la requête passé par le frontEnd, salt combien de fois on execute l'algorithme de hachage
 .then(hash =>{ //Récupération du hash de mot de passe
    const user = new User ({ //avec modèle mongoose :création nouveau utilisateur
        email: req.body.email,// Adresse email qui est fournie dans le corps de la requête
        password: hash // Mot de passe crypté /enregistrement du hash crée auparavant
    });
    user.save() //Enregistrement dans la base de données
    .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))// Code 201 : Création de ressources réussie, envoyée dans un objet
    .catch(error => res.status(400).json({error}));// Code 400 : Serveur ne comprends pas/ ne peut pas traiter la requêt = Erreur côté client
 })
 .catch(error => {
    console.log(error)
    return res.status(500).json({error}) // Code erreur 500 : erreur serveur
    
});
});

/* Exportation fonction connectée des utilisateurs existants
Deux cas de figure : 1 - Véfifier si l'utilisateur existe dans notre BD
2 - Et si le mot de passe transmis par le client correspond à cet utilisateur*/
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Filtre : avec param champs email et valeur transmise par le client
        .then(user => { // Requête réussie : 1 - récupérer l'enregistrement BD : vérifier utilisateur a été trouvé/ Mot de passe est bon
            if (!user) {// Si l'utilisateur n'est pas trouvé dans la BD
                return res.status(401).json({ error: 'adresse mail ou mot de passe incorrecte !' }); //Code erreur 401 : utilisateur non authentifié - Ojet envoyé message flou /Sécurité
            }
            bcrypt.compare(req.body.password, user.password) //Comparaison entre le mot de passe (string) transmis par le client et hash sécurisé la BD
                .then(valid => {
                    if (!valid) {// Si le mot de passe transmis par le client ne concorde pas avec celui enregistré BD
                        return res.status(401).json({ error: 'adresse mail ou mot de passe incorrecte !' })//Code erreur 401 : utilisateur non authentifié - Ojet envoyé message flou /Sécurité
                    }
                    res.status(200).json({// Code 200 Le mot de passe transmis par le client est correcte 
                        userId: user._id, // informations nécessaires à l'authentification des requêtes émises par le client . userId
                        token: jwt.sign( // Chiffrement nouveau token /Signature du token - Créer à partir du header (jwt), du payload et d'un secret
                            { userId: user._id }, // Payload : création d'un objet (userid correspond):données que l'on souhaite encodées dans notre token
                            process.env.JWT_SECRET, // Clef secrète : crypté token (chiffrement/déchiffrement) stockée dans dot.env par sécurité
                            { expiresIn: '2h' } //Configuration durée de vie du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); // Code erreur 500 : erreur serveur
        })
        .catch(error => res.status(500).json({ error })); // Code erreur 500 : erreur serveur
 };