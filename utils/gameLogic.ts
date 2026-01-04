
import { CellData, DifficultyConfig } from '../types';

export function createBoard(config: DifficultyConfig): CellData[][] {
  const { rows, cols } = config;
  const board: CellData[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        x: r,
        y: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0
      });
    }
    board.push(row);
  }
  return board;
}

export function plantMines(board: CellData[][], mineCount: number, firstClick: {r: number, c: number}) {
  const rows = board.length;
  const cols = board[0].length;
  let planted = 0;

  while (planted < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Don't plant mine on first click or already planted cell
    if (
      (r === firstClick.r && c === firstClick.c) || 
      board[r][c].isMine ||
      (Math.abs(r - firstClick.r) <= 1 && Math.abs(c - firstClick.c) <= 1)
    ) {
      continue;
    }

    board[r][c].isMine = true;
    planted++;
  }

  // Calculate neighbors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        board[r][c].neighborCount = getNeighbors(board, r, c).filter(cell => cell.isMine).length;
      }
    }
  }
}

export function getNeighbors(board: CellData[][], r: number, c: number): CellData[] {
  const neighbors: CellData[] = [];
  const rows = board.length;
  const cols = board[0].length;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push(board[nr][nc]);
      }
    }
  }
  return neighbors;
}

export function revealCell(board: CellData[][], r: number, c: number): boolean {
  if (board[r][c].isRevealed || board[r][c].isFlagged) return false;

  board[r][c].isRevealed = true;

  if (board[r][c].isMine) return true; // Hit a mine

  if (board[r][c].neighborCount === 0) {
    const neighbors = getNeighbors(board, r, c);
    neighbors.forEach(n => {
      if (!n.isRevealed) revealCell(board, n.x, n.y);
    });
  }
  return false;
}

export function checkWin(board: CellData[][]): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (!board[r][c].isMine && !board[r][c].isRevealed) return false;
    }
  }
  return true;
}
