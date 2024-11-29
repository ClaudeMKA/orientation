import fs from 'fs';
import { NlpManager } from 'node-nlp';

// Initialisation du modèle NLP
const manager = new NlpManager({ languages: ['fr'] });
manager.settings.log = true;

// Charger le modèle NLP sauvegardé ou afficher une erreur s'il n'existe pas
if (fs.existsSync('model.nlp')) {
  manager.load('model.nlp');
  console.log('Modèle NLP chargé avec succès.');
} else {
  console.error('Aucun modèle NLP trouvé. Veuillez entraîner et sauvegarder le modèle avant utilisation.');
}

export default manager;
