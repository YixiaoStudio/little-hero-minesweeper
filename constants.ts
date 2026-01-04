
import { Difficulty, DifficultyConfig } from './types';

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: {
    rows: 6,
    cols: 6,
    mines: 5,
    label: '新手小英雄'
  },
  [Difficulty.MEDIUM]: {
    rows: 8,
    cols: 8,
    mines: 10,
    label: '中级探险家'
  },
  [Difficulty.HARD]: {
    rows: 10,
    cols: 10,
    mines: 18,
    label: '排雷大宗师'
  }
};

export const THEME_ICONS = {
  MINE: '💣',       // Traditional landmine
  FLAG: '🚩',       // Red flag
  SAFE: '',         // Keep empty for classic 0-neighbor feel
  HIDDEN: '❓',     // Question mark or generic block
  BOOM: '💥',       // Explosion
  EXPLODED: '❌',   // X mark for the specific mine stepped on
  WIN: '🏆',        // Trophy
  LOSE: '🤯'        // Mind blown/Game over
};
