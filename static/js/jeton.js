// --- Gestion du menu déroulant ---
const gear = document.getElementById("gearBtn");
const menu = document.querySelector(".menu-deroulant");

gear.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !gear.contains(e.target)) {
    menu.classList.remove("active");
  }
});

// --- Plateau 2 colonnes x 4 lignes ---
const plateau = [
  [null, null],
  [null, null],
  [null, null],
  [null, null],
];

// --- Faire tomber un jeton ---
function tomberJeton(jetonId, colonne) {
  const jeton = document.getElementById(jetonId);
  if (!jeton) return;

  // Trouver la ligne libre
  let ligne = plateau.length - 1;
  while (ligne >= 0 && plateau[ligne][colonne] !== null) ligne--;
  if (ligne < 0) return; // colonne pleine

  // Calculer la position cible (en % du plateau)
  const cyCase = 12.5 + ligne * 25;
  const translateY = cyCase - 12.5;

  // 🧠 IMPORTANT : utiliser l'attribut SVG "transform"
  jeton.setAttribute("transform", `translate(0, ${translateY}%)`);

  // Marquer la case occupée
  setTimeout(() => {
    plateau[ligne][colonne] = jetonId;
    ajouterNouveauxJetons();
  }, 500);
}

// --- Ajouter de nouveaux jetons ---
function ajouterNouveauxJetons() {
  const svg = document.querySelector(".plateau");
  if (document.getElementById("jeton3")) return; // déjà ajoutés

  const nouveauxJetons = [
    { id: "jeton3", href: "../static/image/Jetons/Jeton4.png", colonne: 0 },
    { id: "jeton4", href: "../static/image/Jetons/Jeton5.png", colonne: 1 },
  ];

  nouveauxJetons.forEach((j) => {
    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
    img.setAttribute("id", j.id);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", j.href);
    img.setAttribute("x", j.colonne === 0 ? "17%" : "67%");
    img.setAttribute("y", "5%");
    img.setAttribute("width", "20%");
    img.setAttribute("height", "20%");
    img.classList.add("jeton");
    svg.appendChild(img);

    // ✅ clic = faire tomber le jeton
    img.addEventListener("click", () => tomberJeton(j.id, j.colonne));
  });
}

// --- Initialisation après chargement du DOM ---
document.addEventListener("DOMContentLoaded", () => {
  const jeton1 = document.getElementById("jeton1");
  const jeton2 = document.getElementById("jeton2");

  if (jeton1) jeton1.addEventListener("click", () => tomberJeton("jeton1", 0));
  if (jeton2) jeton2.addEventListener("click", () => tomberJeton("jeton2", 1));
});
