const express = require('express'); // Importation express
const router = express.Router(); // Création router avec méthode router d'express
const auth = require('../middleware/auth');// Importation middleware authentification
const multer = require('../middleware/multer-config'); // Importation configuration fichier entrant

const sauceCtrl = require('../controllers/sauce'); // Importation de Ctrl

/*      1 - Importation et application des routes disponibles dans notre application CRUD
        2 - Importation middleware auth aux routes pour execution avant gestionnaires de routes
        3 - Importation multer pour gérer les fichiers entrants (modification de la requêt avec un fichier)
        4 - Importation Ctrl pour associer les fonctions aux différentes routes - Gestionnaires de routes
*/

router.get('/', auth, sauceCtrl.getAllSauces); // Création d'un route get pour récupérer toutes les sauces 
router.post('/', auth, multer, sauceCtrl.createSauce);// Création d'un route post pour la création de sauce méthode post
router.get('/:id', auth, sauceCtrl.getOneSauce);// Création d'un route get pour récupérer une sauce avec son param id 
router.put('/:id', auth, multer, sauceCtrl.modifySauce);// Création d'un route put pour la modification de sauce à partir avec son param id 
router.delete('/:id', auth, sauceCtrl.deleteSauce);// Création d'un route delete pour suppression de sauce à partir avec son param id 
router.post('/:id/like', auth, sauceCtrl.likeDislike);// Création d'une route post pour gérer les like et dislike

module.exports = router; // Exportation du router - accès depuis les autres fichiers 