const ROWS = 6,
  COLS = 7;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "R",
  gameOver = false;
let aiEnabled = true,
  difficulty = "moyen";

const columns = document.querySelectorAll(".colonne");
const turnIndicator = document.getElementById("turn-indicator");
const difficultySelect = document.getElementById("difficulty");

difficultySelect.addEventListener(
  "change",
  () => (difficulty = difficultySelect.value)
);
document.getElementById("toggle-ai").addEventListener("click", () => {
  aiEnabled = !aiEnabled;
  alert(`IA ${aiEnabled ? "activée" : "désactivée"}`);
});

columns.forEach((col) =>
  col.addEventListener("click", () => {
    if (gameOver || (aiEnabled && currentPlayer === "J")) return;
    handleMove(parseInt(col.dataset.col));
  })
);

function handleMove(colIndex) {
  const row = getAvailableRow(colIndex);
  if (row === -1) return;

  placeToken(row, colIndex, currentPlayer);

  if (checkWin(currentPlayer)) {
    alert(`${currentPlayer === "R" ? "Noir" : "Jaune"} gagne !`);
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "R" ? "J" : "R";
  turnIndicator.textContent = `Tour du ${
    currentPlayer === "R" ? "Noir" : "Jaune"
  }`;

  if (aiEnabled && currentPlayer === "J") {
    setTimeout(() => {
      const aiCol = window.getAIMove(board, difficulty);
      handleMove(aiCol);
    }, 300);
  }
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
}
function placeToken(row, col, player) {
  board[row][col] = player;
  const token = document.createElement("div");
  token.classList.add("token", player === "R" ? "black" : "yellow");

  // Position horizontale centrée dans la colonne
  const left = 4.55 + col * 13.5; // même que pour les colonnes
  const topStart = 0;
  const topEnd = 6.6 + row * (86.5 / 6); // hauteur du plateau divisée par 6

  token.style.left = `${left + 6.5}%`; // Décalage pour centrer le jeton dans le cercle
  token.style.top = `${topStart}%`;
  document.querySelector(".puissance4").appendChild(token);

  setTimeout(() => (token.style.top = `${topEnd}%`), 10);
}

function checkWin(player) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]].every(
          (v) => v === player
        )
      )
        return true;
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      if (
        [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]].every(
          (v) => v === player
        )
      )
        return true;
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        [
          board[r][c],
          board[r + 1][c + 1],
          board[r + 2][c + 2],
          board[r + 3][c + 3],
        ].every((v) => v === player)
      )
        return true;
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (
        [
          board[r][c],
          board[r - 1][c + 1],
          board[r - 2][c + 2],
          board[r - 3][c + 3],
        ].every((v) => v === player)
      )
        return true;
  return false;
}

// Restart
document.getElementById("restart").addEventListener("click", () => {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  document.querySelectorAll(".token").forEach((t) => t.remove());
  currentPlayer = "R";
  gameOver = false;
  turnIndicator.textContent = "Tour du Black";
});
