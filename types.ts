
export enum GameStatus {
  READY = 'READY',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

export enum Difficulty {
  EASY = 'EASY',   // 6x6, 5 mines
  MEDIUM = 'MEDIUM', // 8x8, 10 mines
  HARD = 'HARD'    // 10x10, 15 mines
}

export interface CellData {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}
