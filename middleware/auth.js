const jwt = require('jsonwebtoken');//Importation de jwt
 
/*Middleware : vérifier les informations d’authentification envoyées par le client
Avec le token envoyé par le client :
vérifier sa validité  : transimission aux autres middlewares et gestionnaire de routes
 */

module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1]; // Récupération du token : récupérer le header, divisé chaine de caractère en tableau autour espace (bearer token), récupérer token
       const decodedToken = jwt.verify(token, process.env.JWT_SECRET);//Décodage du token avec la méthode verify de jwt - params : token récupéré + clef secrète
       const userId = decodedToken.userId;// Récupération de la propriété userId dans token décodé
       req.auth = {// Ajout de propriété userId à objet request, qui est transmis aux routes appelés par la suite
           userId: userId
       };
	next(); //Execution fonction suivant
   } catch(error) {
       res.status(401).json({ error });//Code erreur 401 : utilisateur non authentifié / Token invalide
   }
};