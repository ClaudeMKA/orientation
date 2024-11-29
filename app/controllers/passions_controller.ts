import supabase from '../services/supabaseClient.js';
import manager from '../services/nlpManager.js';

export default class PassionController {
  // Méthode pour entraîner et sauvegarder le modèle
  async trainAndSaveModel() {
    try {
      const { data, error } = await supabase
        .from('phrase_domaine')
        .select('phrase, domains (domain_name)')

      if (error) {
        console.error('Erreur lors de la récupération des données pour entraînement:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.error('Aucune donnée trouvée pour entraîner le modèle.');
        return;
      }

      // Ajouter les phrases au modèle NLP
      data.forEach(entry => {
        if (entry.phrase && entry.domains) {
          manager.addDocument('fr', entry.phrase, entry.domains.domain_name);
        }
      });

      console.log('Entraînement du modèle NLP...');
      await manager.train();
      manager.save('model.nlp'); // Sauvegarder le modèle
      console.log('Modèle entraîné et sauvegardé avec succès.');
    } catch (err) {
      console.error('Erreur lors de l\'entraînement du modèle:', err);
    }
  }

  // Méthode pour prédire le domaine en fonction d'une entrée utilisateur
  async recommendDomain(userInput) {
    try {
      const response = await manager.process('fr', userInput);

      if (response.intent_ranking && Array.isArray(response.intent_ranking)) {
        const sortedIntents = response.intent_ranking.sort((a, b) => b.score - a.score);
        return sortedIntents.map(intent => ({
          domaine: intent.intent,
          confiance: intent.score,
        }));
      } else {
        return [{
          domaine: response.intent,
          confiance: response.score,
        }];
      }
    } catch (err) {
      console.error('Erreur lors de la recommandation de domaine:', err);
      return [];
    }
  }

  // Méthode pour gérer la requête utilisateur
  async handleRequest({ request, response }) {
    try {
      const { user_input } = request.body();

      if (!user_input) {
        return response.status(400).json({
          success: false,
          message: 'La phrase de l\'utilisateur est requise.',
        });
      }

      console.log("Passion de l'utilisateur :", user_input);

      const domainesRecommandes = await this.recommendDomain(user_input);

      return response.json({
        success: true,
        domainesRecommandes,
      });
    } catch (err) {
      console.error('Erreur dans le programme principal :', err);
      return response.status(500).json({
        success: false,
        message: 'Une erreur est survenue.',
      });
    }
  }
}
