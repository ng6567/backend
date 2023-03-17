const mongoose = require('mongoose');//Importation de mongoose

const userSchema = mongoose.Schema({ //Création de schéma de données - Création champs : clef - objet - required = chanps requis
    email: { type: String, required: true, unique: true,},// Sécurité authentification avec unique - une adresse mail par utilisateur
    password: { type: String, required: true}
});

/*Utilisation package mongoose-unique-validator pour éviter plusieurs utilisateurs avec une même adresse mail
const uniqueValidator = require('mongoose-unique-validatore') // Ajout du validateur
userSchema.plugin(uniqueValidator);//Application au schéma avant d'en faire un modèle - On appelle la méthode plugin, arg unique-validator


*/


module.exports = mongoose.model('User', userSchema); //Exportation avec méthode mongoose.model. Model = arg1 nom model, arg2 schéma utilisé