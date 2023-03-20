const Sauce = require("../models/Sauce");//Importation de notre modèle
const fs = require("fs");//Importation module de suppression de fichier

//Exportation de la fonction création de sauce / Authentification utilisateur sécurisée / Générer l'url avec propriétés de l'objet requête (multer nom de fichier seulement)
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //Conversion en objet du corps de la requête
  delete sauceObject._id; //Enlever le champs id du corp de la requête renvoyé par le frontend = Générer automatiquement par MongoDB
  delete sauceObject._userId;//Enlever le champs userId du corp de la requête renvoyé par le frontend = Générer automatiquement par MongoDB
  const sauce = new Sauce({//Création de l'objet
    ...sauceObject,// données transmises par le frontend (moins les deux champs supprimés)
    userId: req.auth.userId, // Vérification de l'identité de l'utilisateur
    imageUrl: `${req.protocol}://${req.get("host")}/images/${ // Générer le nom de l'image : protocole + nom d'hote+ nom de fichier
      req.file.filename
    }`,
  });
  sauce
    .save() //Enregistrement de l'objet sauce dans la base de données avec la méthode Mongoose
    .then(() => {//Envoi de la réponse au frontend
      res.status(201).json({ message: "Objet enregistré !" });// Code 201 : Création de ressources réussie
    })
    .catch((error) => {
      res.status(400).json({ error });// Code 400 : Serveur ne comprends pas/ ne peut pas traiter la requête = Erreur côté client
    });
};

/*Exportation de la fonction pour modifier les sauces
Vérification si l'utilisateur qui souhaite modifier et bien l'utilisateur d'origine
Vérification remplacement d'image ou modification sans image
*/
exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // Récupération de l'objet en BD avec la méthode Mongoose
    .then((sauce) => { 
      if (sauce.userId != req.auth.userId) {// Vérification droit utilisateur (userid BD correspond au userId token)
        res.status(401).json({ message: "Not authorized" });//Code erreur 401 : utilisateur non authentifié 
      } else {
        const sauceObject = { ...req.body };//Copie des champs du corps de la requête
        delete sauceObject._id;//Enlever le champs id du corp de la requête renvoyé par le frontend = Générer automatiquement par MongoDB
        delete sauceObject._userId;//Enlever le champs userId du corp de la requête renvoyé par le frontend = Générer automatiquement par MongoDB
        if (req.file && req.file.filename) { // Si déja une image
          sauceObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${ //Ajout de la nouvelle image
            req.file.filename
          }`;
          const filename = sauce.imageUrl.split("/images/")[1]; //Suppression de l'ancienne image
          fs.unlink(`images/${filename}`, () => {
            Sauce.updateOne({ _id: req.params.id }, sauceObject) // Méthode mongoose updateOne: mettre à jour avec nouvelle image : 1 arg objet à modifier (id BD, 2 arg nouvelle objet)
              .then(() => res.status(200).json({ message: "Objet modifié !" }))//Envoi réponse code 200 ok , modification effectuée
              .catch((error) => res.status(404).json({ error }));//Code 404 : Page web introuvable, indisponible ou n'existe pas
          });
        } else{// Si la modification ne concerne pas l'image
          Sauce.updateOne({ _id: req.params.id }, sauceObject)// Méthode mongoose updateOne: mettre à jour : 1 arg objet à modifier (id BD, 2 arg nouvelle objet)
              .then(() => res.status(200).json({ message: "Objet modifié !" })) //Envoi réponse code 200 ok , modification effectuée
              .catch((error) => res.status(404).json({ error }));//Code 404 : Page web introuvable, indisponible ou n'existe pas
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/* Définit le statut « Like » pour l' userId fourni. 
1 - Si like = 1,l'utilisateur aime (= like) la sauce. 
2 - Si like = 0, l'utilisateur annule son like ou son dislike. 
3 - Si like = -1, l'utilisateur n'aime pas (= dislike) la sauce.
 L'ID de l'utilisateur doit être ajouté ou retiré du tableau approprié. 
Cela permet de garder une trace de leurs préférences et les empêche de liker ou de ne pas disliker la même sauce plusieurs fois : 
un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce.
Le nombre total de « Like » et de « Dislike » est mis à jour à chaque nouvelle notation.
*/

exports.likeDislike= (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // Méthode mongoose findOne pour récupérer la sauce avec id fourni depuis BD
    .then((sauce) => {
    const userId = req.auth.userId // Constante égale au userid fourni par la BD
    const likeAction = req.body.like // Constante égale aux actions pour liker ou disliker transmis par la requête HTTP 
    const userLikeIndex = sauce.usersLiked.findIndex(id => id === userId) // Constant égale à la vérification de like pour un utilisateur (userId) donné
    const userDislikeIndex = sauce.usersDisliked.findIndex(id => id === userId) // Constant égale à la vérification de dislike pour un utilisateur (userId) donné
    if(likeAction==-1 && userDislikeIndex < 0){ //1a) Si action souhaitéé "dislike" et aucun dislike enregistré pour cet utilisateur (userId)
        sauce.usersDisliked.push(userId)//1b) Alors on incrémente le dislike qui sera associé à la valeur du userId de l'utilisateur
        sauce.dislikes ++
    }else if ( likeAction ==1 && userLikeIndex < 0){//2a) Sinon Si action souhaitée "like" et aucun like enregistré pour cet utilisateur 
      sauce.usersLiked.push(userId)//2b) Alors on incrémente le like qui sera associé à la valeur de l'id de l'utilisateur
      sauce.likes ++
    }else if ( likeAction ==0 && userLikeIndex >= 0){//3a) Sinon Si action souhaitée "annuler like" et déja un like enregistré pour cet utilisateur (id)
      sauce.usersLiked.splice(userLikeIndex, 1)//3b) Alors on décrémente le like associé à l'utilisateur (id)
        sauce.likes --
    } else if ( likeAction == 0 && userDislikeIndex >= 0){//4a) Sinon Si action souhaitée "annuler dislike" et déja un dislike enregistré pour cet utilisateur (id)
      sauce.usersDisliked.splice(userLikeIndex, 1) //4b) Alors on décrémente le dislike associé à l'utilisateur (id)
      sauce.dislikes --
    }else{
        return res.status(401).json({ message: "Not authorized" });// Erreur pour autres cas (action ajout/ annulation de like ou dislike impossible )
      }
    
      Sauce.updateOne({ _id: req.params.id }, sauce) // Mise à jour après notation
      .then(() => res.status(200).json({ message: "Objet modifié !" }))
      .catch((error) => res.status(404).json({ error }));
    
        
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Exportation de la fonction suppression d'un objet - Vérification des droits de l'utilisateur
exports.deleteSauce = (req, res, next) => { 
  Sauce.findOne({ _id: req.params.id }) //Méthode mongoose findOne pour récupérer la sauce avec id fourni depuis BD
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) { //Vérification droit utilisateur (userid BD correspond au userId token)
        res.status(401).json({ message: "Not authorized" });//Pas de correspondance = Code erreur 401 : utilisateur non authentifié 
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];//Correspondance : Récupération du nom de fichier
        fs.unlink(`images/${filename}`, () => {// Supression du fichier
          Sauce.deleteOne({ _id: req.params.id }) // Suppression dans la BD référencé par l'id params avec la méthode Mongoose
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });// Envoi réponse code 200 ok, suppresion de la source effectuée
            })
            .catch((error) => res.status(401).json({ error }));//Code erreur 401 : utilisateur non authentifié 
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });// Code erreur 500 : erreur serveur
    });
};
//Exportation de la fonction pour récupérer un seul objet par son id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // Méthode mongoose findOne pour récupérer la sauce avec id fourni depuis BD
    .then((sauce) => res.status(200).json(sauce))// Envoi réponse code 200 ok , et renvoi de la sauce reçues par BD
    .catch((error) => res.status(404).json({ error }));// Code 404 : Page web introuvable, indisponible ou n'existe pas
};
//Exportation de la fonction pour récupérer toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()// Méthode mongoose find pour récupérer toutes les sauces retournées par BD
    .then((sauces) => res.status(200).json(sauces)) // Envoi réponse code 200 ok , et renvoi du tableau des sauces reçues par BD
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ error }); // Code 400 : Serveur ne comprends pas/ ne peut pas traiter la requêt = Erreur côté client, dans un objet
    });
};
