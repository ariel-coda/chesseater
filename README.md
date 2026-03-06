# ♟️ ChessEater — Chess Analysis App

> **Analyse tes parties d'échecs comme un grand maître.**  
> ChessEater combine la puissance de Stockfish, la théorie des ouvertures et l'IA Mistral pour transformer chaque erreur en leçon.

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Stack](https://img.shields.io/badge/stack-JS%20%7C%20Python%20%7C%20Stockfish-informational?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🎯 Aperçu

**ChessEater** est une plateforme d'analyse haute performance conçue pour les joueurs qui veulent progresser sérieusement. Importez vos parties depuis **Lichess** ou **Chess.com**, naviguez coup par coup et laissez Stockfish + Mistral vous expliquer exactement où vous avez perdu la partie — et pourquoi.

---

## ✨ Fonctionnalités

### 🔍 Analyse IA
- Moteur **Stockfish.js** à `depth 13` en Web Worker — analyse complète de la partie au chargement
- Calcul de la perte en **Win%** (méthode Lichess) pour une classification contextuelle précise
- Commentaires générés par **Mistral AI** : directs, humains, orientés sur l'impact tactique réel

### 📖 Théorie des Ouvertures
- Base de données locale **ECO** (5 fichiers TSV, ~3 600 positions) — zéro dépendance API
- Reconnaissance instantanée des lignes théoriques avec nom de la variante

### 🎨 Visualisation Dynamique

| Couleur | Signification |
|--------|---------------|
| 📖 **Bleu** | Coup théorique — Book move |
| ⭐ **Vert clair** | Meilleur coup — Stockfish approuve |
| ✓ **Vert** | Excellent ou Bon coup |
| △ **Jaune** | Imprécision — petit écart |
| ⚠️ **Orange** | Erreur — perte significative |
| ✕ **Rouge** | Gaffe — blunder |

### 🖥️ Interface
- Échiquier interactif propulsé par **Chessground**
- Flèches colorées indiquant le meilleur coup manqué
- Navigation clavier `←` `→` `↑` `↓`
- Import multi-sources : **Lichess** & **Chess.com**

---

## 🛠️ Stack Technique

```
Frontend     →  JavaScript ES6+, Chessground, Chess.js, Lucide Icons
Moteur IA    →  Stockfish.js (Web Worker)
Commentaires →  Mistral AI (mistral-small-latest)
Backend      →  Python + FastAPI + httpx
Paquets      →  pnpm
```

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/chesseater.git
cd chesseater
```

### 2. Environnement virtuel Python

```bash
# Créer l'environnement
python -m venv venv

# Activer sous Windows (PowerShell)
.\venv\Scripts\activate

# Activer sous macOS / Linux
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
MISTRAL_API_KEY=votre_clé_mistral_ici
DEBUG=True
```

> ⚠️ **Ne commitez jamais votre `.env`** — vérifiez qu'il est bien listé dans votre `.gitignore`.

### 4. Lancer le serveur backend

```bash
uvicorn server:app --reload
```

Le serveur tourne par défaut sur `http://127.0.0.1:8000`.

---

## 🚀 Utilisation

1. **Importez** vos parties depuis votre pseudo Chess.com ou Lichess
2. **Sélectionnez** une partie dans la liste — Stockfish lance l'analyse automatiquement
3. **Naviguez** coup par coup avec les flèches clavier ou les boutons
4. **Lisez** le commentaire Mistral pour comprendre chaque décision
5. **Apprenez** en identifiant vos patterns d'erreurs récurrents

---

## 📁 Structure du Projet

```
chesseater/
├── index.html              # Page d'accueil — import de parties
├── analyse.html            # Page d'analyse
├── js/
│   └── analyse.js          # Logique principale (Stockfish + Mistral)
├── lib/
│   ├── stockfish.js        # Moteur Stockfish (Web Worker)
│   └── ouvertures/         # Base ECO (a.tsv → e.tsv)
├── server.py               # Backend FastAPI (proxy Mistral + APIs Chess)
├── requirements.txt
└── .env                    # Clés API (non commité)
```

---

## 🛡️ Sécurité

- Les clés API transitent uniquement par le backend Python — jamais exposées côté frontend
- Le fichier `.env` ne doit **jamais** être versionné
- Ajoutez cette ligne à votre `.gitignore` :

```
.env
venv/
__pycache__/
```

---

## 🤝 Contribution

Les contributions sont les bienvenues.  
Pour tout changement majeur, ouvrez d'abord une **issue** pour en discuter.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -m 'feat: description'`)
4. Pushez (`git push origin feature/ma-feature`)
5. Ouvrez une **Pull Request**

---

## 📄 Licence

Distribué sous licence **MIT**. Voir `LICENSE` pour plus d'informations.

---

<p align="center">
  Fait avec ♟️ et beaucoup de évidemment café lol
</p>
