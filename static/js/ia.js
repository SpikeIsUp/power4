// main.js
// ----- IA Minimax + Jeu complet -----

const ROWS = 6;
const COLS = 7;

// --- IA : Fonctions utilitaires ---

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function availableMoves(board) {
  const moves = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) moves.push(c);
  return moves;
}

function makeMove(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = player;
      return true;
    }
  }
  return false;
}

function undoMove(board, col) {
  for (let r = 0; r < ROWS; r++) {
    if (board[r][col] !== 0) {
      board[r][col] = 0;
      return true;
    }
  }
  return false;
}

function checkWinner(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p === 0) continue;
      if (
        c + 3 < COLS &&
        p === board[r][c + 1] &&
        p === board[r][c + 2] &&
        p === board[r][c + 3]
      )
        return p;
      if (
        r + 3 < ROWS &&
        p === board[r + 1][c] &&
        p === board[r + 2][c] &&
        p === board[r + 3][c]
      )
        return p;
      if (
        r + 3 < ROWS &&
        c + 3 < COLS &&
        p === board[r + 1][c + 1] &&
        p === board[r + 2][c + 2] &&
        p === board[r + 3][c + 3]
      )
        return p;
      if (
        r + 3 < ROWS &&
        c - 3 >= 0 &&
        p === board[r + 1][c - 1] &&
        p === board[r + 2][c - 2] &&
        p === board[r + 3][c - 3]
      )
        return p;
    }
  }
  if (availableMoves(board).length === 0) return 0.5;
  return 0;
}

function scoreWindow(window, ai, human) {
  const aiCount = window.filter((x) => x === ai).length;
  const humanCount = window.filter((x) => x === human).length;
  const emptyCount = window.filter((x) => x === 0).length;
  let score = 0;
  if (aiCount === 4) score += 10000;
  else if (aiCount === 3 && emptyCount === 1) score += 100;
  else if (aiCount === 2 && emptyCount === 2) score += 10;
  if (humanCount === 3 && emptyCount === 1) score -= 80;
  else if (humanCount === 2 && emptyCount === 2) score -= 5;
  return score;
}

function evaluateBoard(board, ai, human) {
  let score = 0;
  const centerArray = [];
  for (let r = 0; r < ROWS; r++)
    centerArray.push(board[r][Math.floor(COLS / 2)]);
  const centerCount = centerArray.filter((x) => x === ai).length;
  score += centerCount * 6;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const w = [
        board[r][c],
        board[r][c + 1],
        board[r][c + 2],
        board[r][c + 3],
      ];
      score += scoreWindow(w, ai, human);
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const w = [
        board[r][c],
        board[r + 1][c],
        board[r + 2][c],
        board[r + 3][c],
      ];
      score += scoreWindow(w, ai, human);
    }
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const w1 = [
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3],
      ];
      const w2 = [
        board[r][c + 3],
        board[r + 1][c + 2],
        board[r + 2][c + 1],
        board[r + 3][c],
      ];
      score += scoreWindow(w1, ai, human) + scoreWindow(w2, ai, human);
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing, ai, human) {
  const win = checkWinner(board);
  if (win === ai) return { score: 100000 };
  if (win === human) return { score: -100000 };
  if (win === 0.5) return { score: 0 };
  if (depth === 0) return { score: evaluateBoard(board, ai, human) };

  const moves = availableMoves(board);
  if (maximizing) {
    let best = { score: -Infinity, col: moves[0] };
    for (const col of moves) {
      makeMove(board, col, ai);
      const val = minimax(
        board,
        depth - 1,
        alpha,
        beta,
        false,
        ai,
        human
      ).score;
      undoMove(board, col);
      if (val > best.score) best = { score: val, col };
      alpha = Math.max(alpha, val);
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = { score: Infinity, col: moves[0] };
    for (const col of moves) {
      makeMove(board, col, human);
      const val = minimax(board, depth - 1, alpha, beta, true, ai, human).score;
      undoMove(board, col);
      if (val < best.score) best = { score: val, col };
      beta = Math.min(beta, val);
      if (alpha >= beta) break;
    }
    return best;
  }
}

function bestMove(board, depth, ai = 2, human = 1) {
  const b = cloneBoard(board);
  const moves = availableMoves(b).sort(
    (a, b2) => Math.abs(a - 3) - Math.abs(b2 - 3)
  );
  let best = { score: -Infinity, col: moves[0] };
  for (const col of moves) {
    makeMove(b, col, ai);
    const val = minimax(
      b,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      ai,
      human
    ).score;
    undoMove(b, col);
    if (val > best.score) best = { score: val, col };
  }
  return best.col;
}

// --- Jeu principal ---

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const difficulty = document.getElementById("difficulty");

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let human = 1;
let ai = 2;
let gameOver = false;

function render() {
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell" + (board[r][c] === 0 ? " empty" : "");
      cell.dataset.col = c;
      if (board[r][c] !== 0) {
        const disc = document.createElement("div");
        disc.className = "disc " + (board[r][c] === 1 ? "player1" : "player2");
        cell.appendChild(disc);
      }
      cell.addEventListener("click", onClickCell);
      boardEl.appendChild(cell);
    }
  }
}

function dropInColumn(col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = player;
      return true;
    }
  }
  return false;
}

function checkWinnerDetailed(b) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (p === 0) continue;
      if (
        c + 3 < COLS &&
        p === b[r][c + 1] &&
        p === b[r][c + 2] &&
        p === b[r][c + 3]
      )
        return {
          winner: p,
          coords: [
            [r, c],
            [r, c + 1],
            [r, c + 2],
            [r, c + 3],
          ],
        };
      if (
        r + 3 < ROWS &&
        p === b[r + 1][c] &&
        p === b[r + 2][c] &&
        p === b[r + 3][c]
      )
        return {
          winner: p,
          coords: [
            [r, c],
            [r + 1, c],
            [r + 2, c],
            [r + 3, c],
          ],
        };
      if (
        r + 3 < ROWS &&
        c + 3 < COLS &&
        p === b[r + 1][c + 1] &&
        p === b[r + 2][c + 2] &&
        p === b[r + 3][c + 3]
      )
        return {
          winner: p,
          coords: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3],
          ],
        };
      if (
        r + 3 < ROWS &&
        c - 3 >= 0 &&
        p === b[r + 1][c - 1] &&
        p === b[r + 2][c - 2] &&
        p === b[r + 3][c - 3]
      )
        return {
          winner: p,
          coords: [
            [r, c],
            [r + 1, c - 1],
            [r + 2, c - 2],
            [r + 3, c - 3],
          ],
        };
    }
  }
  if (availableMoves(b).length === 0) return { winner: 0.5, coords: [] };
  return { winner: 0, coords: [] };
}

function onClickCell(e) {
  if (gameOver) return;
  const col = Number(e.currentTarget.dataset.col);
  if (board[0][col] !== 0) return;

  dropInColumn(col, human);
  render();
  const res = checkWinnerDetailed(board);
  if (res.winner !== 0) return endGame(res);

  statusEl.textContent = "IA réfléchit...";
  setTimeout(() => {
    const depth = Number(difficulty.value);
    const aiCol = bestMove(board, depth, ai, human);
    dropInColumn(aiCol, ai);
    render();
    const res2 = checkWinnerDetailed(board);
    if (res2.winner !== 0) return endGame(res2);
    statusEl.textContent = "À toi de jouer (Jaune)";
  }, 100);
}

function endGame(result) {
  gameOver = true;
  if (result.winner === 1) statusEl.textContent = "Tu as gagné 🎉";
  else if (result.winner === 2) statusEl.textContent = "L'IA a gagné 😢";
  else statusEl.textContent = "Match nul";
  for (const [r, c] of result.coords || []) {
    const idx = r * COLS + c;
    const cell = boardEl.children[idx];
    if (cell) cell.classList.add("win");
  }
}

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  gameOver = false;
  statusEl.textContent = "À toi de jouer (Jaune)";
  render();
}

restartBtn.addEventListener("click", reset);
render();
