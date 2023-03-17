const multer = require('multer'); // Importation package mutler

/*implémentation des téléchargements de fichiers pour que les utilisateurs puissent télécharger des images de sauces 
Avec le package multer qui permet de gérer les fichiers entrants dans les requêtes HTTP.   
*/

const MIME_TYPES = { // Dictionnaire objet composé des 3 différents mimes types depuis le frontend
    'image/jpg': 'jpg',
     'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({ // Création d'un objet de configuration avec deux éléments pour multer - A enregistrer sur le disque
    destination: (req, file, callback) =>{ //1 élément : destination pour indiquer le dossier pour enregistrer les fichiers - fonction 3 arguments (req, file, callback)
        callback(null, 'images') // null : pas d'erreur et nom du dossier
    },
    filename:(req, file, callback) =>{//2 élément : filename pour indiquer le nom de fichier à utiliser (fichier d'origine peut poser problème)
        const name = file.originalname.split(' ').join('_'); //Création du nom (partie avant l'extension) / Gérer les espaces :nom origine du fichier + tableau des différents mots de fichiers + remplacement par des underscores
        const extension = MIME_TYPES[ file.mimetype];//Création extension du fichier :mime type (éléments du dictionnaire) qui correspond au mime type enovyé par le frontend
        callback( null, name + Date.now() + ('.') + extension);// Création du filename en entier : ajout timestamp (unique à la milliseconde près)
    }
});

module.exports = multer({ storage }).single('image');// Exporter multer configuré : Méthode multer + objet storage + single : fichier unique et se sont images