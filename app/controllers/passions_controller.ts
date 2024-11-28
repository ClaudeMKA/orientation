import { createClient } from '@supabase/supabase-js'; // Import de Supabase
import fs from 'fs'; // Import de fs avec la syntaxe ES6
//@ts-ignore
import { NlpManager } from 'node-nlp'; // Import du module NlpManager avec la syntaxe ES6

// Initialisation de Supabase
const supabaseUrl = 'https://tvcpntlvdgnorkmgsyon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Y3BudGx2ZGdub3JrbWdzeW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MjU2NDAsImV4cCI6MjA0ODEwMTY0MH0.tHb-dzNs6mlfr84IXRhoSc6sS1vCnTpbS-s1o1Wnfvk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialisation du modèle NLP
const manager = new NlpManager({ languages: ['fr'] });
manager.settings.log = true;  // Activer les logs pendant l'entraînement

export default class PassionController {
  // Méthode pour récupérer les phrases et domaines depuis Supabase
  async getPhrasesAndDomains(limit = 1000, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('phrase_domaine')
        .select('phrase, domains (domain_name)')
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erreur lors de la récupération des phrases et domaines :', error);
        return [];
      }

      return data.map(entry => ({
        phrase: entry.phrase,
        domaine_name: entry.domains ? entry.domains.domain_name : 'Domaine inconnu',
      }));
    } catch (err) {
      console.error('Erreur inattendue :', err);
      return [];
    }
  }

  // Méthode pour récupérer toutes les phrases et domaines (par pagination)
  async getAllPhrasesAndDomains() {
    let offset = 0;
    const limit = 1000;
    const allData = [];
    let moreData = true;

    while (moreData) {
      const result = await this.getPhrasesAndDomains(limit, offset);
      allData.push(...result);

      if (result.length < limit) {
        moreData = false;
      } else {
        offset += limit;
      }
    }

    return allData;
  }

  // Méthode pour entraîner le modèle NLP avec les données récupérées
  async trainModel() {
    const data = await this.getAllPhrasesAndDomains(); // Appel à getAllPhrasesAndDomains

    if (data.length === 0) {
      console.error("Aucune donnée trouvée pour entraîner le modèle.");
      return;
    }

    fs.writeFileSync('training_data_log.json', JSON.stringify(data, null, 2), 'utf-8');
    console.log('Les données d\'entraînement ont été sauvegardées dans "training_data_log.json".');

    // Ajout des phrases au modèle NLP
    data.forEach(entry => {
      if (entry.phrase.includes('musculation')) {
        manager.addDocument('fr', entry.phrase, 'Sport');
      } else {
        manager.addDocument('fr', entry.phrase, entry.domaine_name);
      }
    });

    console.log('Entraînement du modèle...');
    await manager.train();
    manager.save();
    console.log('Modèle entraîné avec succès.');
  }

  // Méthode pour recommander un domaine en fonction de l'entrée utilisateur
  async recommendDomain(userInput) {
    const response = await manager.process('fr', userInput);
    console.log('Réponse du modèle :');

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
  }

  // Méthode pour gérer la requête de l'utilisateur avec le HttpContext
  public async handleRequest({ request, response }: HttpContext) {
    try {
      console.log('Entraînement du modèle NLP...');
      await this.trainModel(); // Entraîner le modèle avec les données

      // Récupérer la phrase de l'utilisateur à partir du body de la requête
      const { user_input } = request.body(); // Récupérer les données du body

      if (!user_input) {
        return response.status(400).json({
          success: false,
          message: 'La phrase de l\'utilisateur est requise.',
        });
      }

      console.log("Passion de l'utilisateur : ", user_input);

      // Recommander les domaines en fonction de la phrase de l'utilisateur
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
