// === Repère exact du plateau (viewBox 675x575) ===
const cx = [65, 156, 247, 338, 429, 520, 610]; // centres X des 7 colonnes
const cy = [80, 163, 246, 329, 412, 495];      // centres Y des 6 lignes
const R  = 34;                                  // rayon d'un trou
const D  = R * 2;                               // diamètre = taille jeton

// État local
let state = {
  grid: [],
  turn: 0,
  over: false,
  winner: -1,
  names: ["Joueur 1", "Joueur 2"],
};

// Images de jetons (valeurs par défaut – seront écrasées par l'API)
let tokenImg = {
  0: "/static/image/Jetons/Jeton4.png", // J1
  1: "/static/image/Jetons/Jeton5.png", // J2
};

let animating = false;

// ---------- Helpers DOM ----------
function $svg() { return document.querySelector(".puissance4 svg"); }
function $layer() {
  const svg = $svg();
  let g = svg.querySelector("#tokensLayer");
  if (!g) {
    g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", "tokensLayer");
    svg.appendChild(g);
  }
  return g;
}
function ensureBanner() {
  let banner = document.getElementById("namesBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "namesBanner";
    banner.style.position = "fixed";
    banner.style.left = "50%";
    banner.style.top = "12px";
    banner.style.transform = "translateX(-50%)";
    banner.style.padding = "8px 14px";
    banner.style.borderRadius = "10px";
    banner.style.fontWeight = "800";
    banner.style.letterSpacing = "0.5px";
    banner.style.color = "#fff";
    banner.style.background = "rgba(0,0,0,.35)";
    banner.style.backdropFilter = "blur(2px)";
    banner.style.textShadow = "0 0 8px rgba(0,0,0,.6)";
    banner.style.zIndex = "6";
    document.body.appendChild(banner);
  }
  return banner;
}
function updateBanner() {
  const banner = ensureBanner();
  banner.textContent = `${state.names?.[0] || "Joueur 1"} vs ${state.names?.[1] || "Joueur 2"}`;
}

// ---------- API ----------
async function fetchState() {
  const res = await fetch("/api/state");
  const data = await res.json();
  state.grid   = data.grid;
  state.turn   = data.turn;
  state.over   = data.over;
  state.winner = data.winner;
  state.names  = data.names || state.names;

  // Jetons personnalisés renvoyés par le serveur
  if (data.tokenUrls) {
    tokenImg[0] = data.tokenUrls[0];
    tokenImg[1] = data.tokenUrls[1];
  }

  renderTokens();
  updateBanner();

  if (state.over) {
    showVictory();
    const board = document.querySelector(".puissance4");
    if (board) board.classList.add("disabled");
  }
}

// ---------- Rendu des jetons dans le même SVG (alignement parfait) ----------
function renderTokens() {
  const layer = $layer();
  layer.innerHTML = ""; // reset

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      const cell = state.grid[i][j];
      if (cell === 0 || cell === 1) {
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttributeNS("http://www.w3.org/1999/xlink", "href", tokenImg[cell]);
        img.setAttribute("x", cx[j] - R);
        img.setAttribute("y", cy[i] - R);
        img.setAttribute("width", D);
        img.setAttribute("height", D);
        img.setAttribute("preserveAspectRatio", "xMidYMid slice");
        layer.appendChild(img);
      }
    }
  }
}

// ---------- Animation de chute (dans le SVG) ----------
function animateDrop(col, row, player) {
  animating = true;
  const layer = $layer();

  const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
  img.setAttributeNS("http://www.w3.org/1999/xlink", "href", tokenImg[player]);
  img.setAttribute("x", cx[col] - R);
  img.setAttribute("y", -D); // démarre au-dessus
  img.setAttribute("width", D);
  img.setAttribute("height", D);
  img.setAttribute("preserveAspectRatio", "xMidYMid slice");
  img.style.filter = "drop-shadow(0 8px 6px rgba(0,0,0,.35))";
  layer.appendChild(img);

  const targetY = cy[row] - R;
  const duration = 300; // ms
  const t0 = performance.now();

  function step(t) {
    const p = Math.min(1, (t - t0) / duration);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out
    const y = -D + (targetY + D) * ease;
    img.setAttribute("y", y);
    if (p < 1) requestAnimationFrame(step);
    else {
      animating = false;
      renderTokens(); // replace proprement dans la grille finale
    }
  }
  requestAnimationFrame(step);
}

// ---------- Jouer un coup ----------
async function play(col) {
  if (state.over || animating) return;

  const r = await fetch("/api/turn", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ col }),
  });
  const data = await r.json();
  if (data.error) return; // ex: colonne pleine

  // Animation avec la case renvoyée par le serveur
  animateDrop(data.col, data.row, data.player);

  // Met à jour l’état local (le rendu final sera refait après l’anim)
  state.grid   = data.grid;
  state.over   = data.over;
  state.winner = data.winner;
  state.turn   = data.nextTurn;
  state.names  = data.names || state.names;
  if (data.tokenUrls) {
    tokenImg[0] = data.tokenUrls[0];
    tokenImg[1] = data.tokenUrls[1];
  }
  updateBanner();

  if (state.over) {
    setTimeout(() => {
      showVictory();
      const board = document.querySelector(".puissance4");
      if (board) board.classList.add("disabled"); // blocage des clics
    }, 320);
  }
}

// ---------- Reset ----------
async function resetGame() {
  if (animating) return;
  await fetch("/api/reset", { method: "POST" });
  const overlay = document.getElementById("victoryOverlay");
  if (overlay) overlay.classList.remove("visible");
  const board = document.querySelector(".puissance4");
  if (board) board.classList.remove("disabled");
  await fetchState();
}

// ---------- Overlay de victoire ----------
function showVictory() {
  const overlay  = document.getElementById("victoryOverlay");
  const title    = document.getElementById("victoryTitle");
  const subtitle = document.getElementById("victorySubtitle");
  if (!overlay || !title) return;

  if (state.winner === 2) {
    title.textContent = "MATCH NUL";
    if (subtitle) subtitle.textContent = "Rejouer ou retour Menu";
  } else {
    const txt = state.winner === 0
      ? `${state.names?.[0] || "Joueur 1"} GAGNE`
      : `${state.names?.[1] || "Joueur 2"} GAGNE`;
    title.textContent = txt;
    if (subtitle) subtitle.textContent = "Rejouer ou retour Menu";
  }
  title.classList.add("blink-arcade");
  overlay.classList.add("visible");
}

// ---------- Bind colonnes ----------
function bindColumns() {
  for (let c = 1; c <= 7; c++) {
    const el = document.querySelector(".colonne" + c);
    if (!el) continue;
    el.addEventListener("click", () => {
      if (!state.over && !animating) play(c - 1);
    });
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  bindColumns();
  fetchState();

  // gear/menu existants (si présents dans la page)
  const gear = document.getElementById("gear");
  const menu = document.querySelector(".menu");
  if (gear && menu) {
    gear.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("active"); });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !gear.contains(e.target)) menu.classList.remove("active");
    });
  }

  // boutons overlay
  const btnReset = document.getElementById("btnRejouer");
  const btnMenu  = document.getElementById("btnMenu");
  if (btnReset) btnReset.addEventListener("click", resetGame);
  if (btnMenu)  btnMenu.addEventListener("click", () => (window.location.href = "/"));
});
