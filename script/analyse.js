import { Chessground } from "https://unpkg.com/chessground?module";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/+esm";

// ══════════════════════════════════════════
// 1. LUCIDE
// ══════════════════════════════════════════
lucide.createIcons();

// ══════════════════════════════════════════
// 2. LOCALSTORAGE
// ══════════════════════════════════════════
const partieRaw = localStorage.getItem("chesseater_partie");
if (!partieRaw) window.location.href = "../index.html";
const partie = JSON.parse(partieRaw);

// ══════════════════════════════════════════
// 3. CHESS.JS
// ══════════════════════════════════════════
const chess = new Chess();

if (partie.pgn) {
  const pgnNettoye = partie.pgn
    .replace(/\{[^}]*\}/g, "")
    .replace(/\$\d+/g, "")
    .trim();
  chess.loadPgn(pgnNettoye);
}

const header = chess.header();
const historique = chess.history({ verbose: true });
chess.reset();

let indexCoup = -1;
let flipped = false;

// ══════════════════════════════════════════
// 4. INFOS JOUEURS
// ══════════════════════════════════════════
const joueurBlanc = header.White ?? "Blanc";
const joueurNoir = header.Black ?? "Noir";
const eloBlanc = header.WhiteElo ?? "?";
const eloNoir = header.BlackElo ?? "?";

const resultats = {
  "1-0": "Victoire blancs",
  "0-1": "Victoire noirs",
  "1/2-1/2": "Nulle",
};
const resultat = resultats[header.Result] ?? "?";
const nbCoups = historique.length;

document.getElementById("playerWhiteName").textContent = joueurBlanc;
document.getElementById("playerWhiteElo").textContent = eloBlanc + " Elo";
document.getElementById("playerBlackName").textContent = joueurNoir;
document.getElementById("playerBlackElo").textContent = eloNoir + " Elo";
document.getElementById("gameOpponent").textContent = "vs. " + partie.opponent;
document.getElementById("gameInfo").textContent =
  partie.format + " · " + nbCoups + " coups · " + resultat;

// ══════════════════════════════════════════
// 5. CHESSGROUND
// ══════════════════════════════════════════
function getLegalMoves() {
  const dests = new Map();
  chess.moves({ verbose: true }).forEach((m) => {
    if (!dests.has(m.from)) dests.set(m.from, []);
    dests.get(m.from).push(m.to);
  });
  return dests;
}

const cg = Chessground(document.getElementById("board"), {
  fen: chess.fen(),
  orientation: "white",
  movable: { free: false, color: null, dests: getLegalMoves() },
  animation: { enabled: true, duration: 150 },
  highlight: { lastMove: true, check: true },
  drawable: { enabled: true, visible: true },
});

// ══════════════════════════════════════════
// 6. ANNOTATIONS
// ══════════════════════════════════════════
const ANNOTATION_SEUILS = [
  {
    max: 0,
    label: "Meilleur",
    symbol: "⭐",
    bg: "#81b64c20",
    color: "#81b64c",
  },
  {
    max: 2,
    label: "Excellent",
    symbol: "✓",
    bg: "#4a8c4a20",
    color: "#4a8c4a",
  },
  { max: 5, label: "Bon", symbol: "✓", bg: "#4a7a4a20", color: "#4a7a4a" },
  {
    max: 10,
    label: "Imprécision",
    symbol: "△",
    bg: "#c8b84c20",
    color: "#c8b84c",
  },
  { max: 20, label: "Erreur", symbol: "⚠", bg: "#d0823c20", color: "#d0823c" },
  {
    max: Infinity,
    label: "Gaffe",
    symbol: "✕",
    bg: "#e0525220",
    color: "#e05252",
  },
];

const ANNOTATION_THEORIQUE = {
  label: "Théorique",
  symbol: "📖",
  bg: "#00b8d920",
  color: "#00b8d9",
};

function cpToWinPercent(cp) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function getAnnotation(pertWin) {
  return ANNOTATION_SEUILS.find((s) => pertWin <= s.max);
}

// ══════════════════════════════════════════
// 7. BASE OUVERTURES LOCALE
// ══════════════════════════════════════════
let baseOuvertures = {};

async function chargerBaseOuvertures() {
  try {
    const fichiers = ["a", "b", "c", "d", "e"];
    for (const f of fichiers) {
      const response = await fetch(`../lib/ouvertures/${f}.tsv`);
      const text = await response.text();
      const lignes = text.trim().split("\n").slice(1);
      lignes.forEach((ligne) => {
        const cols = ligne.split("\t");
        const nom = cols[1];
        const pgn = cols[2];
        if (!nom || !pgn) return;
        try {
          const tempChess = new Chess();
          tempChess.loadPgn(pgn);
          const epd = tempChess.fen().split(" ").slice(0, 4).join(" ");
          baseOuvertures[epd] = nom;
        } catch (e) {
          /* PGN invalide, ignoré */
        }
      });
    }
    console.log(
      "📖 Base locale prête :",
      Object.keys(baseOuvertures).length,
      "positions.",
    );
  } catch (e) {
    console.error("Erreur base ouvertures :", e);
  }
}
chargerBaseOuvertures();

function verifierTheorieLocale(fen) {
  const epd = fen.split(" ").slice(0, 4).join(" ");
  return baseOuvertures[epd] || null;
}

// ══════════════════════════════════════════
// 8. STOCKFISH — pré-analyse toute la partie
// ══════════════════════════════════════════
const scores = [];
const bestmoves = [];

let indexAnalyse = 0;
let scoreEnCours = 0;
let analyseTerminee = false;

function normaliser(score, n) {
  return n % 2 === 0 ? score : -score;
}

const stockfish = new Worker("../lib/stockfish.js");
stockfish.onerror = (e) => console.error("Erreur Stockfish :", e);

stockfish.onmessage = (event) => {
  const msg = event.data;

  if (
    msg.includes("score cp") &&
    !msg.includes("lowerbound") &&
    !msg.includes("upperbound")
  ) {
    const raw = parseInt(msg.split("score cp ")[1].split(" ")[0]);
    scoreEnCours = normaliser(raw, indexAnalyse);
  }

  if (msg.includes("score mate")) {
    const mat = parseInt(msg.split("score mate ")[1].split(" ")[0]);
    scoreEnCours = normaliser(mat > 0 ? 10000 : -10000, indexAnalyse);
  }

  if (msg.startsWith("bestmove")) {
    scores[indexAnalyse] = indexAnalyse === 0 ? 0 : scoreEnCours;
    bestmoves[indexAnalyse] = msg.split(" ")[1];
    indexAnalyse++;

    if (indexAnalyse <= historique.length) {
      analyserPositionIndex(indexAnalyse);
    } else {
      analyseTerminee = true;
      console.log("✅ Analyse Stockfish terminée");
      chess.reset();
      for (let i = 0; i <= indexCoup; i++) {
        if (historique[i]) chess.move(historique[i].san);
      }
      rafraichir();
    }
  }
};

stockfish.postMessage("uci");
stockfish.postMessage("isready");

function analyserPositionIndex(n) {
  const tempChess = new Chess();
  for (let i = 0; i < n; i++) tempChess.move(historique[i].san);
  stockfish.postMessage("position fen " + tempChess.fen());
  stockfish.postMessage("go depth 18");
}

analyserPositionIndex(0);

// ══════════════════════════════════════════
// 9. GÉNÉRATION COMMENTAIRE MISTRAL
// ══════════════════════════════════════════
async function genererCommentaire(
  coupJoue,
  meilleurCoup,
  annotation,
  pertWin,
  evalAvant,
  evalApres,
  nomOuverture,
) {
  const nomJoueur = indexCoup % 2 === 0 ? joueurBlanc : joueurNoir;
  const nomAdversaire = indexCoup % 2 === 0 ? joueurNoir : joueurBlanc;
  const numeroTour = Math.floor(indexCoup / 2) + 1;

  const estBestMove =
    meilleurCoup === coupJoue.from + coupJoue.to + (coupJoue.promotion ?? "");

  const bestmoveTexte = meilleurCoup
    ? meilleurCoup.substring(0, 2) + "-" + meilleurCoup.substring(2, 4)
    : "";

  const prompt = `Tu es un traducteur d'analyse échecs. Tu transformes des données de Stockfish en texte humain court. Tu n'as pas d'opinion propre et tu traduis uniquement ce que les données indiquent.

DONNÉES STOCKFISH :
- Coup joué : ${coupJoue.san}
- Verdict : ${annotation.label}
- Meilleur coup selon Stockfish : ${estBestMove ? coupJoue.san + " (c'est le meilleur coup)" : bestmoveTexte}
- Perte de chances : ${pertWin.toFixed(1)}%
- Évaluation : ${(evalAvant / 100).toFixed(2)} → ${(evalApres / 100).toFixed(2)}
${nomOuverture ? `- Position théorique : ${nomOuverture}` : ""}

RÈGLES ABSOLUES :
- 1 à 2 phrases maximum, jamais plus
- Commence directement par l'analyse et jamais par le nom du coup ni par son verdict
- N'utilise le nom d'un joueur qu'une seule fois maximum dans ta réponse et uniquement si c'est naturel
- Un coup théorique = explique uniquement l'idée stratégique de la ligne, rien d'autre
- Tu es TOUJOURS du même avis que Stockfish — jamais de suggestion contraire à ses données
- Pas de ponctuation bizarre comme — ou autres uniquement utilisé points et virgules
- Pas de répétition du verdict en début de phrase
- Tu ne parles pas en terme de chiffres tu expliques clairement

EXEMPLES EXACTS DU FORMAT ATTENDU :

Nc6 est une imprécision.

e4 est un excellent coup d'ouverture qui contrôle le centre et prépare le développement. C'est une ouverture très populaire et solide.

Oh non! ${nomJoueur} laisse la case d5 sans défense, ce que ${nomAdversaire} risque d'exploiter immédiatement avec **Fd5!**. **${coupJoue.san}??** était une erreur de calcul.

Ce recul cède l'initiative à ${nomAdversaire} qui va consolider son centre. **${bestmoveTexte}** maintenait la pression sans perdre de tempo.

C'est un coup correct mais passif. **${bestmoveTexte}** était plus précis et gardait un avantage concret."

Bonne décision qui contrôle e5 et prépare le développement. C'est exactement ce que j'aurais joué. La position reste favorable.

C'est exactement le coup qui correspond. **${coupJoue.san}!** est la meilleure réponse dans cette position et maintient l'avantage.

L'ouverture ${nomOuverture}  consiste à préparer le développement rapide et la lutte pour le centre. C'est une ouverture qui peut s'avérer très intéressante si bien exécuter.


`;

  const response = await fetch("/api/commentaire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error("Erreur API");

  const data = await response.json();
  const texte = data.choices[0].message.content;

  let html = texte
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /<strong>([^<]*\?\?[^<]*)<\/strong>/g,
      '<strong style="color:#e05252">$1</strong>',
    )
    .replace(
      /<strong>([^<]*(?<!\?)\?(?!\?)[^<]*)<\/strong>/g,
      '<strong style="color:#d0823c">$1</strong>',
    )
    .replace(
      /<strong>([^<]*![^!<][^<]*)<\/strong>/g,
      '<strong style="color:#81b64c">$1</strong>',
    )
    .replace(
      new RegExp(`<strong>(${joueurBlanc}|${joueurNoir})<\\/strong>`, "g"),
      '<strong style="color:#e8e8e8">$1</strong>',
    );

  return html;
}

// ══════════════════════════════════════════
// 10. PANNEAU COMMENTAIRE
// ══════════════════════════════════════════
async function mettreAJourPanneau() {
  if (indexCoup < 0 || !analyseTerminee) return;

  const evalAvant = scores[indexCoup];
  const evalApres = scores[indexCoup + 1];
  const meilleurCoup = bestmoves[indexCoup];
  const coupJoue = historique[indexCoup];
  const numeroTour = Math.floor(indexCoup / 2) + 1;

  if (evalAvant === undefined || evalApres === undefined) return;

  // ── Théorie ──
  const tempChess = new Chess();
  for (let j = 0; j < indexCoup; j++) tempChess.move(historique[j].san);
  const nomOuverture =
    indexCoup === 0
      ? "Partie d'échecs"
      : verifierTheorieLocale(tempChess.fen());

  // ── Win% et annotation ──
  const winAvant = cpToWinPercent(evalAvant);
  const winApres = cpToWinPercent(evalApres);
  const pertWin = Math.max(0, winAvant - winApres);
  const annotation = nomOuverture
    ? ANNOTATION_THEORIQUE
    : getAnnotation(pertWin);

  // ── Flèches ──
  if (meilleurCoup && meilleurCoup !== "(none)") {
    const coupUci = coupJoue.from + coupJoue.to + (coupJoue.promotion ?? "");
    cg.setShapes([
      {
        orig: meilleurCoup.substring(0, 2),
        dest: meilleurCoup.substring(2, 4),
        brush: coupUci === meilleurCoup ? "blue" : "green",
      },
    ]);
  }

  // ── UI ──
  const badge = document.getElementById("annotationBadge");
  badge.textContent = annotation.symbol;
  badge.style.background = annotation.bg;
  badge.style.color = annotation.color;

  document.getElementById("coupActuel").textContent =
    numeroTour + ". " + coupJoue.san;
  document.getElementById("annotationLabel").textContent = annotation.label;
  document.getElementById("annotationLabel").style.color = annotation.color;

  if (meilleurCoup && meilleurCoup !== "(none)") {
    document.getElementById("meilleurCoupLabel").textContent =
      meilleurCoup.substring(0, 2) + "-" + meilleurCoup.substring(2, 4);
  }

  const elApres = document.getElementById("evalApres");
  elApres.textContent =
    (evalApres >= 0 ? "+" : "") + (evalApres / 100).toFixed(1);
  elApres.style.color = evalApres >= 0 ? "#81b64c" : "#e05252";

  document.getElementById("perteCentipawns").textContent = nomOuverture
    ? "Théorie"
    : "−" + pertWin.toFixed(1) + "% Win";
  document.getElementById("perteCentipawns").style.color = annotation.color;

  if (nomOuverture && nomOuverture !== "Partie d'échecs") {
    document.getElementById("gameInfo").textContent = nomOuverture;
  }

  // ── Commentaire Mistral ──
  const commentaireEl = document.getElementById("commentaireIA");

  const titreCoup = `<div style="
    font-size: 1.05rem;
    font-weight: 700;
    color: ${annotation.color};
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid ${annotation.color}40;
    letter-spacing: 0.02em;
  ">${coupJoue.san} — ${annotation.label} ${annotation.symbol}</div>`;

  commentaireEl.innerHTML =
    titreCoup +
    `<span style="color:#555;font-style:italic;font-size:0.85rem;">Analyse en cours...</span>`;

  genererCommentaire(
    coupJoue,
    meilleurCoup,
    annotation,
    pertWin,
    evalAvant,
    evalApres,
    nomOuverture,
  )
    .then((html) => {
      commentaireEl.innerHTML =
        titreCoup +
        `<div style="line-height:1.65;font-size:0.9rem;color:#ccc;">${html}</div>`;
    })
    .catch(() => {
      commentaireEl.innerHTML =
        titreCoup +
        `<span style="color:#555;font-style:italic;font-size:0.85rem;">Commentaire indisponible.</span>`;
    });
}

// ══════════════════════════════════════════
// 11. NAVIGATION
// ══════════════════════════════════════════
function rafraichir() {
  cg.set({ fen: chess.fen() });

  document.getElementById("moveLabel").textContent =
    indexCoup < 0
      ? "Position de départ"
      : `Coup ${indexCoup + 1} / ${historique.length}`;

  document
    .querySelectorAll(".move-cell")
    .forEach((el) => el.classList.remove("active"));
  if (indexCoup >= 0) {
    const cellules = document.querySelectorAll(".move-cell");
    if (cellules[indexCoup]) cellules[indexCoup].classList.add("active");
  }

  if (indexCoup < 0) cg.setShapes([]);
  mettreAJourPanneau();
}

function goFirst() {
  chess.reset();
  indexCoup = -1;
  cg.setShapes([]);
  rafraichir();
}

function goPrev() {
  if (indexCoup < 0) return;
  chess.reset();
  for (let i = 0; i <= indexCoup - 1; i++) chess.move(historique[i].san);
  indexCoup--;
  rafraichir();
}

function goNext() {
  if (indexCoup >= historique.length - 1) return;
  indexCoup++;
  chess.move(historique[indexCoup].san);
  rafraichir();
}

function goLast() {
  chess.reset();
  historique.forEach((m) => chess.move(m.san));
  indexCoup = historique.length - 1;
  rafraichir();
}

function goToMove(index) {
  chess.reset();
  for (let i = 0; i <= index; i++) chess.move(historique[i].san);
  indexCoup = index;
  rafraichir();
}

function flipBoard() {
  flipped = !flipped;
  cg.set({ orientation: flipped ? "black" : "white" });
}

// ══════════════════════════════════════════
// 12. LISTE DES COUPS
// ══════════════════════════════════════════
function renderMoveList() {
  const container = document.getElementById("moveListContainer");
  container.innerHTML = "";

  for (let i = 0; i < historique.length; i += 2) {
    const row = document.createElement("div");
    row.className = "move-row gap-1 items-center py-0.5";

    const num = document.createElement("div");
    num.className = "text-ce-500 text-xs font-mono pl-1 flex items-center";
    num.textContent = Math.floor(i / 2) + 1 + ".";

    const wCell = document.createElement("div");
    wCell.className = "move-cell";
    wCell.textContent = historique[i].san;
    wCell.addEventListener("click", () => goToMove(i));

    const bCell = document.createElement("div");
    bCell.className = "move-cell";
    if (historique[i + 1]) {
      bCell.textContent = historique[i + 1].san;
      bCell.addEventListener("click", () => goToMove(i + 1));
    }

    row.appendChild(num);
    row.appendChild(wCell);
    row.appendChild(bCell);
    container.appendChild(row);
  }
}

// ══════════════════════════════════════════
// 13. TABS
// ══════════════════════════════════════════
function switchTab(name) {
  document.getElementById("tab-comment").classList.add("hidden");
  document.getElementById("tab-moves").classList.add("hidden");
  document.getElementById("tab-" + name).classList.remove("hidden");
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("tabBtn-" + name).classList.add("active");
}

// ══════════════════════════════════════════
// 14. BOUTONS & CLAVIER
// ══════════════════════════════════════════
document.getElementById("btnFirst").addEventListener("click", goFirst);
document.getElementById("btnPrev").addEventListener("click", goPrev);
document.getElementById("btnNext").addEventListener("click", goNext);
document.getElementById("btnLast").addEventListener("click", goLast);
document.getElementById("btnFlip").addEventListener("click", flipBoard);

document
  .getElementById("tabBtn-comment")
  .addEventListener("click", () => switchTab("comment"));
document
  .getElementById("tabBtn-moves")
  .addEventListener("click", () => switchTab("moves"));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowUp") goFirst();
  if (e.key === "ArrowDown") goLast();
});

// ══════════════════════════════════════════
// 15. LANCEMENT
// ══════════════════════════════════════════
renderMoveList();
rafraichir();
