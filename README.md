<a name="retour-en-haut"></a>
<h1 align="center">
  PulsePulse - API
  <br>
</h1>

<h4 align="center">API REST pour l'application de planification de programme fitness PulsePulse
    <br><br>
</h4>

<p align="center">
  <a href="#à-propos-du-projet">À propos du projet</a> •
  <a href="#installation">Installation</a> •
  <a href="#real-time-api">Real-Time API</a> •
  <a href="#exécution-des-tests">Exécution des tests</a> •
  <a href="#utilisation">Utilisation</a> •
  <a href="#contact">Contact</a>
</p>


## À propos du projet
Dans le cadre du projet du cours ArchiOWeb de la HEIG-VD en Ingénierie des Médias. Notre équipe réalise une API REST pour l'application mobile de fitness PulsePulse. 

L'objectif, pouvoir servir les données stockées dans une base de données MongoDB à l'application.
<br><br>
### Développé avec

[![Nodejs][Nodejs.com]][Nodejs-url] [![Expressjs][Expressjs.com]][Expressjs-url] [![MongoDB][MongoDB.com]][MongoDB-url] [![Jest][Jest.com]][Jest-url]
<br><br>
## Installation
Pour cloner cette application en local, vous aurez besoin de [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/en/download/) (qui vient avec [npm](http://npmjs.com)) et d'un serveur [MongoDB](https://www.mongodb.com/) installés sur votre ordinateur. Ensuite, exécutez ces lignes de commandes.

```bash
# Cloner le repo
$ git clone https://github.com/KevinPasteur/PulsePulse-API

# Aller dans le répertoire
$ cd pulsepulse-api

# Installation des dépendances
$ npm i

# Créer un fichier .env à la racine et y insérer ces variables d'environnements
PORT=4000
JWT_SECRET=pulseSecret
DATABASE_URL=mongodb://localhost:27017/pulsepulse

# Lancer le projet, vous avez le choix entre node et nodemon
$ npm start #Utilise node
$ npm run dev #Utilise nodemon

# (OPTIONNEL) Si un problème devait survenir avec les tests, installer cross-env
$ npm i cross-env

```

<p align="right">(<a href="#retour-en-haut">retour en haut</a>)</p>

## Real-Time API

Lien : ws://pulsepulse-api.onrender.com/

Notre API dispose de 2 endpoints proposant des messages en temps réel.

Lors de la création d'un exercice et lors de la création d'un workout de statut "Public".
Un message est alors envoyé aux clients.

### Exemple: Exercice
```json
{
    "message": {
        "id": "656a0d0e774b76321412d4fd",
        "name": "Pompe",
        "description": "Exercice pour les bras, pecs et épaules",
        "duration": 10,
        "repetitions": 10,
        "sets": 3,
        "level": "facile",
        "bodyPart": [
            "epaules",
            "bras",
            "pecs"
        ],
        "status": "active"
    },
    "action": "create",
    "type": "exercise",
    "info": "New exercise created"
}
```

### Exemple: Workout publique
```json
{
    "message": {
        "id": "656a0a0a774b76321412d4f4",
        "name": "Back Day's",
        "description": "Le jour du dos",
        "isPublic": true
    },
    "action": "create",
    "type": "workout",
    "info": "New public workout created"
}
```
<p align="right">(<a href="#retour-en-haut">retour en haut</a>)</p>

## Exécution des tests

Lorsque vous utilisez l'application en local, vous pouvez exécuter les tests grâce à jest.

Pour se faire utilisez la commande ``` $ npm run test ```

<p align="right">(<a href="#retour-en-haut">retour en haut</a>)</p>

## Utilisation

Les endpoints de l'API sont disponibles ici : <a href="https://pulsepulse-api.onrender.com/api-docs/"> Documentation API </a>

<em> L'application étant hébergée depuis une version gratuite de render, elle peut mettre du temps à charger lors de la première requête </em>

<p align="right">(<a href="#retour-en-haut">retour en haut</a>)</p>

## Contact
La team makema - HEIG-VD - Ingénierie des Médias

<p align="right">(<a href="#retour-en-haut">retour en haut</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[MongoDB-url]: https://www.mongodb.com/
[MongoDB.com]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[Nodejs-url]: https://nodejs.org
[Nodejs.com]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Expressjs-url]: https://expressjs.com/
[Expressjs.com]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[Jest-url]: https://jestjs.io/
[Jest.com]: https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white
