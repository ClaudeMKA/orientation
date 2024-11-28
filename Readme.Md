# OrientationIA - Application d'Orientation des Élèves par Passion

## Principe de l'application

Le but de cette application est d'aider les élèves à découvrir leur domaine de prédilection en fonction de leurs passions. Grâce à l'intelligence artificielle (IA), l'application analyse les préférences des utilisateurs (sous forme de texte) et leur recommande des domaines d'activité qui leur correspondent.

L'IA s'améliore au fur et à mesure que de nouvelles données sont ajoutées dans la base de données, permettant ainsi des recommandations de plus en plus précises.

### Fonctionnement

L'application repose sur une base de données hébergée sur **Supabase**, où sont stockées les informations sur les passions des utilisateurs et les domaines associés. Plus il y a de données dans la base, plus l'IA apprend et devient précise pour faire des recommandations.

### Structure de la Base de Données

La base de données contient les informations suivantes :

- **Phrases d'utilisateurs** : Des phrases exprimant les passions ou intérêts des utilisateurs.
- **Domaines associés** : Des domaines professionnels ou académiques correspondant aux passions des utilisateurs.

### L'intelligence artificielle (IA)

L'IA est alimentée par un modèle NLP (Natural Language Processing) qui prend en entrée les phrases des utilisateurs et recommande un ou plusieurs domaines en fonction de ces phrases. Le modèle s'entraîne sur les données présentes dans la base de données Supabase et devient plus performant avec le temps.

## L'API

L'application propose une API permettant d'interagir avec le modèle et d'obtenir des recommandations en fonction des passions de l'utilisateur.

### Route principale : `POST /register`

- **URL** : `http://localhost:3333/register`
- **Méthode HTTP** : `POST`
- **Body** :

```json
{
  "user_input": "J'aime jouer aux jeux vidéo"
}
````

Response
````
{
  "success": true,
  "domainesRecommandes": [
    {
      "domaine": "Informatique",
      "confiance": 1
    }
  ]
}

````
## Améliorations futures
Ajouter plus de données pour améliorer la précision des recommandations.
Permettre à l'utilisateur de soumettre des retours sur les recommandations pour affiner l'IA.
Ajouter une interface utilisateur pour que les élèves puissent interagir plus facilement avec le système.

## Pour lancer l'application

````aiignore
git clone <URL du repository>
cd <nom du dossier>

````

````aiignore
npm install
````

````aiignore
node ace serve --watch
````

L'API sera disponible sur http://localhost:3333.


