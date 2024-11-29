import supabase from '../services/supabaseClient.js';
import manager from '../services/nlpManager.js';

export default class PassionController {
  // Méthode pour entraîner et sauvegarder le modèle
  async trainAndSaveModel() {
    try {
      const allData = [];
      let start = 0;
      const limit = 1000; // Taille maximale par lot

      // Récupération de toutes les données avec pagination
      while (true) {
        const { data, error } = await supabase
          .from('phrase_domaine')
          .select('phrase, domains (domain_name)')
          .range(start, start + limit - 1); // Récupère un lot de données

        if (error) {
          console.error('Erreur lors de la récupération des données pour entraînement:', error);
          return;
        }

        if (!data || data.length === 0) {
          break; // Sortir si aucune donnée supplémentaire n'est retournée
        }

        allData.push(...data); // Ajouter les données récupérées
        start += limit; // Passer au lot suivant
      }

      console.log(`Nombre total de phrases récupérées : ${allData.length}`);

      if (allData.length === 0) {
        console.error('Aucune donnée trouvée pour entraîner le modèle.');
        return;
      }

      // Ajouter les phrases au modèle NLP
      allData.forEach(entry => {
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

  // Méthode pour ajouter des phrases à un domaine et entraîner le modèle
// Méthode pour ajouter des phrases à un domaine et entraîner le modèle
  async addPhraseAndTrain({ request, response }) {
    try {
      const { domain, phrases } = request.body();

      if (!domain || !Array.isArray(phrases) || phrases.length === 0) {
        return response.status(400).json({
          success: false,
          message: 'Domaine et phrases sont requis.',
        });
      }

      // Récupérer l'ID du domaine depuis la table `domains`
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select('id')
        .ilike('domain_name', domain);  // Utilisation de 'ilike' pour une recherche insensible à la casse

      if (domainError) {
        console.error('Erreur lors de la récupération de l\'ID du domaine :', domainError);
        return response.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du domaine.',
        });
      }

      if (!domainData || domainData.length === 0) {
        return response.status(404).json({
          success: false,
          message: `Domaine ${domain} introuvable.`,
        });
      }

      // Si plusieurs domaines sont trouvés, on prend le premier
      const domainId = domainData[0].id; // L'ID du domaine récupéré

      // Sauvegarder les phrases dans la base de données avec le domain_id
      const { data, error } = await supabase
        .from('phrase_domaine')
        .insert(phrases.map(phrase => ({ phrase, domaine_id: domainId })));

      if (error) {
        console.error('Erreur lors de l\'insertion des phrases :', error);
        return response.status(500).json({
          success: false,
          message: 'Impossible d\'ajouter les phrases à la base de données.',
        });
      }

      console.log(`Phrases ajoutées au domaine ${domain} avec ID ${domainId}.`);

      // Ajouter les phrases au modèle NLP
      phrases.forEach(phrase => manager.addDocument('fr', phrase, domain));

      // Entraîner le modèle après mise à jour
      console.log('Entraînement du modèle NLP...');
      await manager.train();
      manager.save('model.nlp'); // Sauvegarder le modèle
      console.log('Modèle entraîné et sauvegardé avec succès.');

      return response.json({
        success: true,
        message: 'Phrases ajoutées et modèle entraîné avec succès.',
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de phrases et de l\'entraînement du modèle :', err);
      return response.status(500).json({
        success: false,
        message: 'Une erreur est survenue.',
      });
    }
  }

  // Méthode pour ajouter plusieurs phrases à un domaine
  async addPhrasesToDomain(domain, phrases) {
    try {
      if (!domain || !Array.isArray(phrases) || phrases.length === 0) {
        console.error('Le domaine ou les phrases sont invalides.');
        return;
      }

      phrases.forEach(phrase => {
        if (phrase && typeof phrase === 'string') {
          manager.addDocument('fr', phrase, domain);
        }
      });

      console.log(`Ajouté ${phrases.length} phrases au domaine "${domain}".`);
    } catch (err) {
      console.error('Erreur lors de l\'ajout des phrases au domaine:', err);
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
