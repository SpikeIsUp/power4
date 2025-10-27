const gear = document.getElementById("gearBtn");
const menu = document.querySelector(".menu-deroulant");

gear.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("active");
});
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !gear.contains(e.target))
    menu.classList.remove("active");
});

const plateau = [
  [null, null],
  [null, null],
  [null, null],
  [null, null],
];
let tour = 0;
const imageByPlayer = [
  "../static/image/Jetons/jeton_joueur1.png",
  "../static/image/Jetons/jeton_joueur2.png",
];

const svg = document.querySelector(".plateau");
const jetonsLayer = document.getElementById("jetonsLayer");

function getTrousInfo() {
  const trous = [];
  document.querySelectorAll("#trous circle").forEach((c) => {
    const col = parseInt(c.dataset.col);
    const row = parseInt(c.dataset.row);
    trous.push({ col, row, cx: c.cx.baseVal.value, cy: c.cy.baseVal.value });
  });
  return trous;
}
const trousInfo = getTrousInfo();

function ligneLibre(col) {
  for (let r = plateau.length - 1; r >= 0; r--) if (!plateau[r][col]) return r;
  return -1;
}

function svgPointToClient(svgEl, x, y) {
  const pt = svgEl.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const ctm = svgEl.getScreenCTM();
  return pt.matrixTransform(ctm);
}

async function tomberJeton(jetonEl, col) {
  const ligne = ligneLibre(col);
  if (ligne < 0) return;
  const cible = trousInfo.find((t) => t.col === col && t.row === ligne);
  const bbox = jetonEl.getBoundingClientRect();
  const center = {
    x: bbox.left + bbox.width / 2,
    y: bbox.top + bbox.height / 2,
  };
  const cibleClient = svgPointToClient(svg, cible.cx, cible.cy);
  const deltaY = cibleClient.y - center.y;
  jetonEl.style.transform = `translate(0px, ${deltaY}px)`;
  await new Promise((r) => setTimeout(r, 650));
  plateau[ligne][col] = { elId: jetonEl.id, player: jetonEl.dataset.player };
  jetonEl.classList.add("pose");
  ajouterNouveauxJetons();
  tour = 1 - tour;
}

function ajouterNouveauxJetons() {
  for (let col = 0; col < 2; col++) {
    const exist = Array.from(document.querySelectorAll(".jeton")).some(
      (img) => img.dataset.spawn === "true" && parseInt(img.dataset.col) === col
    );
    if (!exist) creerJetonSpawn(col);
  }
}

function creerJetonSpawn(col) {
  const id = `spawn_${Date.now()}_${col}`;
  const ns = "http://www.w3.org/2000/svg";
  const img = document.createElementNS(ns, "image");
  img.setAttribute("id", id);
  img.setAttribute("href", imageByPlayer[tour]);
  img.setAttribute("x", col === 0 ? "10%" : "70%");
  img.setAttribute("y", "2%");
  img.setAttribute("width", "20%");
  img.setAttribute("height", "20%");
  img.classList.add("jeton");
  img.dataset.spawn = "true";
  img.dataset.col = String(col);
  img.dataset.player = String(tour);
  jetonsLayer.appendChild(img);
  img.addEventListener("click", () => {
    if (ligneLibre(col) < 0) return;
    tomberJeton(img, col);
    img.dataset.spawn = "consumed";
  });
}

window.addEventListener("load", () => {
  const initials = ["jeton1", "jeton2"];
  initials.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.player = String(idx % 2 === 0 ? 0 : 1);
    el.dataset.spawn = "true";
    el.dataset.col = String(idx);
    jetonsLayer.appendChild(el);
    el.addEventListener("click", () => {
      if (el.dataset.spawn !== "true") return;
      tomberJeton(el, parseInt(el.dataset.col));
      el.dataset.spawn = "consumed";
    });
  });
  ajouterNouveauxJetons();
});
