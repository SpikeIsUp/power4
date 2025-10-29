function getAIMove(board, difficulty) {
  const available = [];
  for (let c = 0; c < 7; c++) if (!board[0][c]) available.push(c);

  if (difficulty === "facile") {
    // aléatoire
    return available[Math.floor(Math.random() * available.length)];
  }

  if (difficulty === "moyen") {
    // bloque le joueur si gagnant, sinon aléatoire
    for (let c of available) {
      const r = getAvailableRowForAI(board, c);
      board[r][c] = "R";
      if (checkWinForAI(board, "R")) {
        board[r][c] = null;
        return c;
      }
      board[r][c] = null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  if (difficulty === "difficile") {
    // Minimax simple profondeur 3
    let bestScore = -Infinity;
    let move = available[0];
    for (let c of available) {
      const r = getAvailableRowForAI(board, c);
      board[r][c] = "J";
      let score = minimax(board, 3, false);
      board[r][c] = null;
      if (score > bestScore) {
        bestScore = score;
        move = c;
      }
    }
    return move;
  }

  return available[Math.floor(Math.random() * available.length)];
}

// fonctions auxiliaires
function getAvailableRowForAI(board, col) {
  for (let r = 5; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
}

function checkWinForAI(playerBoard, player) {
  // même logique que checkWin main.js mais sur playerBoard
  for (let r = 0; r < 6; r++)
    for (let c = 0; c <= 3; c++)
      if (
        [
          playerBoard[r][c],
          playerBoard[r][c + 1],
          playerBoard[r][c + 2],
          playerBoard[r][c + 3],
        ].every((v) => v === player)
      )
        return true;
  for (let r = 0; r <= 2; r++)
    for (let c = 0; c < 7; c++)
      if (
        [
          playerBoard[r][c],
          playerBoard[r + 1][c],
          playerBoard[r + 2][c],
          playerBoard[r + 3][c],
        ].every((v) => v === player)
      )
        return true;
  for (let r = 0; r <= 2; r++)
    for (let c = 0; c <= 3; c++)
      if (
        [
          playerBoard[r][c],
          playerBoard[r + 1][c + 1],
          playerBoard[r + 2][c + 2],
          playerBoard[r + 3][c + 3],
        ].every((v) => v === player)
      )
        return true;
  for (let r = 3; r < 6; r++)
    for (let c = 0; c <= 3; c++)
      if (
        [
          playerBoard[r][c],
          playerBoard[r - 1][c + 1],
          playerBoard[r - 2][c + 2],
          playerBoard[r - 3][c + 3],
        ].every((v) => v === player)
      )
        return true;
  return false;
}

// Minimax simplifié (profondeur limitée)
function minimax(board, depth, isMaximizing) {
  if (depth === 0) return 0;
  let available = [];
  for (let c = 0; c < 7; c++) if (!board[0][c]) available.push(c);
  if (available.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let c of available) {
      const r = getAvailableRowForAI(board, c);
      board[r][c] = "J";
      if (checkWinForAI(board, "J")) {
        board[r][c] = null;
        return 100;
      }
      let evalScore = minimax(board, depth - 1, false);
      board[r][c] = null;
      if (evalScore > maxEval) maxEval = evalScore;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let c of available) {
      const r = getAvailableRowForAI(board, c);
      board[r][c] = "R";
      if (checkWinForAI(board, "R")) {
        board[r][c] = null;
        return -100;
      }
      let evalScore = minimax(board, depth - 1, true);
      board[r][c] = null;
      if (evalScore < minEval) minEval = evalScore;
    }
    return minEval;
  }
}
