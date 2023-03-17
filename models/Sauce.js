const mongoose = require('mongoose'); //Importation de mongoose
const sauceSchema = mongoose.Schema({ //Création de schéma de données - Création champs : clef - objet - required = chanps requis
  userId: { type: String, required: true }, // Pas nécessaire car id déja généré par notre base de données
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat : { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: []},
    usersDisliked: { type: [String], default: []}
});

module.exports = mongoose.model('Sauce', sauceSchema);//Exportation avec méthode mongoose.model. Model = arg1 nom model, arg2 schéma utilisé