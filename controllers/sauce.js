const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const sauceObject = { ...req.body };
        delete sauceObject._id;
        delete sauceObject._userId;
        if (req.file && req.file.filename) {
          sauceObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`;
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.updateOne({ _id: req.params.id }, sauceObject)
              .then(() => res.status(200).json({ message: "Objet modifié !" }))
              .catch((error) => res.status(404).json({ error }));
          });
        } else{
          Sauce.updateOne({ _id: req.params.id }, sauceObject)
              .then(() => res.status(200).json({ message: "Objet modifié !" }))
              .catch((error) => res.status(404).json({ error }));
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
exports.likeDislike= (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
    const userId = req.auth.userId
    const likeAction = req.body.like
    const userLikeIndex = sauce.usersLiked.findIndex(id => id === userId)
    const userDislikeIndex = sauce.usersDisliked.findIndex(id => id === userId)
    if(likeAction==-1 && userDislikeIndex < 0){
        sauce.usersDisliked.push(userId)
        sauce.dislikes ++
    }else if ( likeAction ==1 && userLikeIndex < 0){
      sauce.usersLiked.push(userId)
      sauce.likes ++
    }else if ( likeAction ==0 && userLikeIndex >= 0){
      sauce.usersLiked.splice(userLikeIndex, 1)
        sauce.likes --
    } else if ( likeAction == 0 && userDislikeIndex >= 0){
      sauce.usersDisliked.splice(userLikeIndex, 1)
      sauce.dislikes --
    }else{
        return res.status(401).json({ message: "Not authorized" });
      }
    
      Sauce.updateOne({ _id: req.params.id }, sauce)
      .then(() => res.status(200).json({ message: "Objet modifié !" }))
      .catch((error) => res.status(404).json({ error }));
    
        
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ error });
    });
};
