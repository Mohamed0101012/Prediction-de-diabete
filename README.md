# 🩺 Diabète Info — Outil pédagogique de sensibilisation au risque de diabète :

Application web (PWA) permettant d'estimer, à titre pédagogique, le risque statistique de diabète à partir de données médicales simples, avec explicabilité des facteurs de risque (SHAP) et recommandations générales.

> ⚠️ **Avertissement** : Cet outil est à visée pédagogique et de sensibilisation uniquement. Il ne constitue en aucun cas un outil de diagnostic médical et ne remplace pas l'avis d'un professionnel de santé.

---

## 📋 Sommaire :

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Installation et lancement](#installation-et-lancement)
- [Lancement avec Docker](#lancement-avec-docker)
- [Tester sur smartphone](#tester-sur-smartphone)
- [Tests](#tests)
- [Pipeline CI/CD](#pipeline-cicd)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Modèle de Machine Learning](#modèle-de-machine-learning)

---

## Fonctionnalités :

- **Questionnaire de sensibilisation** : saisie de données médicales simples (glucose, IMC, tension, etc.)
- **Estimation statistique du risque** de diabète via un modèle XGBoost
- **Explicabilité (SHAP)** : affichage des facteurs ayant le plus influencé chaque prédiction
- **Recommandations générales** non médicales, basées sur les valeurs saisies
- **Historique anonyme** des questionnaires remplis
- **Dashboard administrateur** avec statistiques agrégées
- **Authentification** avec deux profils utilisateurs (`user` / `admin`)
- **Application installable (PWA)**, utilisable sur ordinateur et smartphone

---

## Stack technique :

**Machine Learning**
- Python, scikit-learn, XGBoost, SHAP, Pandas, Jupyter

**Backend**
- FastAPI, SQLAlchemy, SQLite, JWT (python-jose), bcrypt (passlib)

**Frontend**
- React (Vite), React Router, Axios, Recharts, Lucide Icons
- PWA (vite-plugin-pwa)

**Déploiement**
- Docker, Docker Compose
- GitHub Actions (CI/CD)

---

## Architecture du projet :

ProjetFin/
├── ml/ # Exploration des données et entraînement du modèle
│ ├── diabetes.csv
│ ├── exploration.ipynb
│ ├── model_xgb.joblib
│ └── feature_names.joblib
├── backend/ # API FastAPI
│ ├── app/
│ │ ├── main.py # Point d'entrée de l'API
│ │ ├── database.py # Configuration SQLite
│ │ ├── ml_service.py # Logique de prédiction + SHAP
│ │ ├── security.py # Authentification JWT
│ │ ├── schemas.py # Schémas Pydantic
│ │ ├── models/ # Modèles de base de données
│ │ └── routers/ # Routes (auth, etc.)
│ ├── tests/ # Tests unitaires (pytest)
│ ├── requirements.txt
│ └── Dockerfile
├── frontend/ # Application React (PWA)
│ ├── src/
│ │ ├── pages/ # Questionnaire, Résultat, Dashboard, etc.
│ │ ├── components/ # Sidebar, Layout
│ │ └── api.js # Configuration Axios
│ └── Dockerfile
├── .github/workflows/ci.yml # Pipeline CI/CD
└── docker-compose.yml

---

## Installation et lancement :

### Prérequis :

- Python 3.11
- Node.js 20+
- Docker Desktop (pour le lancement conteneurisé)

### 1. Backend (API) :

```powershell
cd backend
python -m venv ../venv
../venv/Scripts/Activate.ps1      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

L'API est accessible sur **http://127.0.0.1:8000**
Documentation interactive (Swagger) : **http://127.0.0.1:8000/docs**

### 2. Frontend (React) :

Dans un autre terminal :

```powershell
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## Lancement avec Docker :

Depuis la racine du projet :

```powershell
docker compose up --build
```

- Frontend : **http://localhost:3000**
- Backend / Swagger : **http://localhost:8000/docs**

Pour arrêter les conteneurs :
```powershell
docker compose down
```

⚠️ Après toute modification du code frontend, reconstruire l'image sans cache pour éviter les problèmes de cache de build :
```powershell
docker compose build --no-cache frontend
docker compose up
```

---

## Tester sur smartphone :

Par défaut, l'application (`frontend/src/api.js`) pointe vers `http://127.0.0.1:8000`, ce qui ne fonctionne que depuis l'ordinateur qui héberge l'API.

**Pour tester depuis un smartphone connecté au même réseau Wi-Fi :**

1. Trouver l'adresse IP locale de l'ordinateur :
```powershell
   ipconfig
```
   Repérer l'"Adresse IPv4" (ex : `192.168.1.42`)

2. Modifier temporairement `frontend/src/api.js` :
```javascript
   baseURL: "http://192.168.1.42:8000",
```

3. Reconstruire l'image Docker du frontend :
```powershell
   docker compose down
   docker compose build --no-cache frontend
   docker compose up
```

4. Sur le smartphone, ouvrir un navigateur et aller sur :

http://192.168.1.42:3000


5. Il est possible d'installer l'application comme une PWA via le menu du navigateur ("Ajouter à l'écran d'accueil" / "Installer l'application").

⚠️ **Penser à remettre `http://127.0.0.1:8000` dans `api.js` après la démonstration**, pour retrouver un usage normal sur PC.

---

## Tests :

Les tests unitaires et d'intégration se trouvent dans `backend/tests/`.

```powershell
cd backend
pytest tests/ -v
```

Tests couverts :
- Fonctionnement de la route racine
- Prédiction avec des données valides
- Rejet des données incomplètes (validation Pydantic)
- Inscription et connexion utilisateur
- Protection des routes nécessitant une authentification admin

---

## Pipeline CI/CD :

Un pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute automatiquement à chaque `push` sur la branche `main` :

1. **backend-tests** : installation des dépendances Python et exécution des tests `pytest`
2. **frontend-build** : installation des dépendances et build de production React
3. **docker-build** : construction des images Docker du backend et du frontend (ne s'exécute que si les deux étapes précédentes réussissent)

Résultats visibles dans l'onglet **Actions** du dépôt GitHub.

---

## Comptes de démonstration :

| Rôle | Email | Mot de passe |
|------|-------|---------------|
| Utilisateur | user@test.com | motdepasse123 |
| Administrateur | *(compte promu via la page "Utilisateurs")* | — |

Un nouvel administrateur peut être créé en s'inscrivant via `/register`, puis en étant promu par un administrateur existant depuis la page **Utilisateurs**.

---

## Modèle de Machine Learning :

- **Dataset** : Pima Indians Diabetes Dataset (768 observations, 8 variables cliniques)
- **Modèles comparés** : Régression Logistique (baseline), Random Forest, XGBoost
- **Modèle retenu** : XGBoost (Accuracy 89%, Recall 85.2%, ROC-AUC 0.946)
- **Validation** : validation croisée à 5 plis (ROC-AUC moyen 0.951 ± 0.010)
- **Explicabilité** : SHAP (TreeExplainer), affichage des 3 facteurs les plus influents par prédiction

Le détail de l'exploration, de l'entraînement et de l'évaluation des modèles se trouve dans `ml/exploration.ipynb`.

---

## Auteur :

Projet de fin d'année — développé par Maamar Mohamed Al Aarbi.