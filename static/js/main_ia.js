const ROWS = 6,
  COLS = 7;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "R",
  gameOver = false;
let aiEnabled = true;
let difficulty = "moyen";

const columns = document.querySelectorAll(".colonne");
const turnIndicator = document.getElementById("turn-indicator");
const difficultySelect = document.getElementById("difficulty");

difficultySelect.addEventListener("change", () => {
  difficulty = difficultySelect.value;
});

columns.forEach((col) => {
  col.addEventListener("click", () => {
    if (gameOver || (aiEnabled && currentPlayer === "J")) return;
    handleMove(parseInt(col.dataset.col));
  });
});

function handleMove(colIndex) {
  const row = getAvailableRow(colIndex);
  if (row === -1) return;

  placeToken(row, colIndex, currentPlayer);

  if (checkWin(currentPlayer)) {
    alert(`${currentPlayer === "R" ? "Rouge" : "Jaune"} gagne !`);
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "R" ? "J" : "R";
  turnIndicator.textContent = `Tour du ${
    currentPlayer === "R" ? "Rouge" : "Jaune"
  }`;

  if (aiEnabled && currentPlayer === "J") {
    setTimeout(() => {
      const aiCol = getAIMove(board, difficulty);
      handleMove(aiCol);
    }, 300);
  }
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

function placeToken(row, col, player) {
  board[row][col] = player;
  const token = document.createElement("div");
  token.classList.add("token", player === "R" ? "red" : "yellow");

  // Position précise pour tomber dans le cercle
  const left = (65 / 675) * 100 + col * ((91 / 675) * 100);
  const topStart = 0;
  const topEnd = (80 / 575) * 100 + row * ((83 / 575) * 100);

  token.style.left = `${left}%`;
  token.style.top = `${topStart}%`;
  document.querySelector(".puissance4").appendChild(token);

  setTimeout(() => (token.style.top = `${topEnd}%`), 10);
}

// Vérification victoire horizontale, verticale, diagonale
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
  turnIndicator.textContent = "Tour du Rouge";
});
