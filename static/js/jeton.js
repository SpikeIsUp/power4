const gear = document.getElementById("gearBtn");
const menu = document.querySelector(".menu-deroulant");
gear.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("active");
});
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !gear.contains(e.target))
    menu.classList.remove("active");
}); // Plateau 2 colonnes x 4 lignes
const plateau = [
  [null, null],
  [null, null],
  [null, null],
  [null, null],
]; // Faire tomber un jeton
function tomberJeton(jetonId, colonne) {
  const jeton = document.getElementById(jetonId);
  if (!jeton) return;
  let ligne = plateau.length - 1;
  while (ligne >= 0 && plateau[ligne][colonne] !== null) ligne--;
  if (ligne < 0) return;
  const cyCase = 12.5 + ligne * 25;
  const translateY = cyCase - 12.5;
  jeton.style.transform = "translateY(" + translateY + "%)";
  setTimeout(() => {
    plateau[ligne][colonne] = jetonId;
    ajouterNouveauxJetons();
  }, 500);
} // Ajouter de nouveaux jetons
function ajouterNouveauxJetons() {
  const svg = document.querySelector(".plateau");
  if (document.getElementById("jeton3")) return;
  const nouveauxJetons = [
    { id: "jeton3", href: "../static/image/jeton1.png", colonne: 0 },
    { id: "jeton4", href: "../static/image/jeton2.png", colonne: 1 },
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
    img.addEventListener("click", () => tomberJeton(j.id, j.colonne));
  });
} // Jetons initiaux clicables
window.onload = () => {
  document
    .getElementById("jeton1")
    .addEventListener("click", () => tomberJeton("jeton1", 0));
  document
    .getElementById("jeton2")
    .addEventListener("click", () => tomberJeton("jeton2", 1));
};
