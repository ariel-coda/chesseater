# GreatMentor ♞

Ton coach d'échecs personnel — analyse tes parties, suit ta progression et t'explique les meilleurs coups selon ton niveau.

> Projet open source — prototype fonctionnel en cours de construction.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16.1.7 + TypeScript + Tailwind CSS |
| Backend | Python 3.12.10 + FastAPI |
| Base de données | Supabase (PostgreSQL) |
| Analyse échecs | Stockfish (local) + Lichess API |
| Coach IA | Mistral API (gratuit) |
| Auth | Supabase Auth (Email + Google OAuth) |

---

## Fonctionnalités prévues

- [x] Authentification (email + Google OAuth)
- [x] Connexion comptes Chess.com et Lichess
- [ ] Récupération automatique des parties
- [ ] Analyse des parties par Stockfish
- [ ] Coaching IA adapté au niveau Elo
- [ ] Suivi de progression par mode de jeu
- [ ] Gamification (badges, objectifs)

---

## Prérequis

- Node.js 18+
- Python 3.12.10+
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Mistral](https://console.mistral.ai) (gratuit)
- Stockfish installé localement

---

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/ton-username/greatmentor.git
cd greatmentor
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```

Remplis `.env.local` avec tes clés :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
MISTRAL_API_KEY=xxxx
```

### 3. Installer les dépendances frontend
```bash
npm install
```

### 4. Installer les dépendances backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows : venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Configurer Supabase

Lance les requêtes SQL dans **Supabase → SQL Editor** dans cet ordre :

1. `database/01_profiles.sql`
2. `database/02_games.sql`

---

## Lancer le projet en local

### Frontend (Next.js)
```bash
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
# → http://localhost:8000
# → Documentation auto : http://localhost:8000/docs
```

---

## Structure du projet
```
greatmentor/
├── public/                  # Assets statiques (logo, images)
├── src/
│   ├── app/
│   │   ├── (auth)/          # Pages login et register
│   │   ├── (app)/           # Pages protégées (dashboard, coach...)
│   │   └── api/             # API routes Next.js
│   ├── components/          # Composants React réutilisables
│   ├── lib/                 # Clients Supabase + utilitaires
│   ├── hooks/               # Hooks React personnalisés
│   └── types/               # Types TypeScript
├── backend/
│   ├── routers/             # Routes FastAPI
│   ├── services/            # Chess.com, Lichess, Stockfish, Mistral
│   ├── models/              # Schémas Pydantic
│   └── core/                # Config et client Supabase Python
├── database/                # Fichiers SQL Supabase
├── .env.example             # Modèle de variables d'environnement
├── .gitignore
└── README.md
```

---

## Plateformes d'échecs supportées

| Plateforme | Données récupérées |
|---|---|
| Chess.com | Profil, Elo par mode, parties (PGN), ouvertures, accuracy |
| Lichess | Profil, Elo par mode, parties (PGN/JSON), évaluation Stockfish |

---

## Contribution

Le projet est open source et les contributions sont les bienvenues.

1. Fork le projet
2. Crée une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit tes changements (`git commit -m 'feat: ajout de ma fonctionnalité'`)
4. Push la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvre une Pull Request

---

## Licence

MIT — libre d'utilisation, de modification et de distribution.

---

*GreatMentor est un projet indépendant, non affilié à Chess.com ou Lichess.*