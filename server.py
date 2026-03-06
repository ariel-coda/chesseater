import httpx
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Autorise ton HTML à parler au serveur
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"], 
    allow_headers=["*"],
)
load_dotenv() # Charge les variables du fichier .env
api_key = os.getenv("MISTRAL_API_KEY")

@app.post("/api/commentaire")
async def generer_commentaire(data: dict):
    prompt = data.get("prompt")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistral-small-latest",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300
            }
        )
    
    return response.json()

@app.get("/api/games/chesscom/all")
async def get_all_chesscom_games(username: str):
    headers = {"User-Agent": "ChessEater/1.0"}

    async with httpx.AsyncClient() as client:

        # Étape 1 : récupère la liste de toutes les URLs d'archives
        archives_url = f"https://api.chess.com/pub/player/{username}/games/archives"
        archives_response = await client.get(archives_url, headers=headers)
        archives = archives_response.json().get("archives", [])

        # Étape 2 : boucle sur chaque archive et accumule toutes les parties
        all_games = []
        for archive_url in archives:
            games_response = await client.get(archive_url, headers=headers)
            games = games_response.json().get("games", [])
            all_games.extend(games)

    return {"games": all_games[-50:], "total": len(all_games)}

@app.get("/api/games/lichess/all")
async def get_all_lichess_games(username: str):
    url = f"https://lichess.org/api/games/user/{username}?max=500&pgnInJson=true"
    headers = {
        "User-Agent": "ChessEater/1.0",
        "Accept": "application/x-ndjson"  # on dit à Lichess qu'on veut du NDJSON
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

        # On découpe la réponse ligne par ligne et on parse chaque ligne séparément
        all_games = []
        for line in response.text.strip().split("\n"):
            if line:
                all_games.append(json.loads(line))

    return {"games": all_games[-250:], "total": len(all_games)}

# Sert tes fichiers HTML/CSS/JS directement
app.mount("/", StaticFiles(directory=".", html=True), name="static")