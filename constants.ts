
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
  MINE: '💣',
  FLAG: '🚩',
  SAFE: '',
  HIDDEN: '❓',
  BOOM: '💥',
  EXPLODED: '❌',
  WIN: '🏆',
  LOSE: '🤯'
};

export const LOCAL_MESSAGES = {
  start: [
    "你好，勇敢的排雷小英雄！点击方块开始寻找宝藏吧！",
    "新的一场冒险开始了，小心避开危险的小地雷哦！",
    "动动小脑筋，看看今天谁能最快通关？",
    "魔法森林里藏着亮晶晶的宝藏，让我们出发吧！"
  ],
  win: [
    "你太棒了！像小英雄一样聪明，成功找出了所有地雷！",
    "完美的胜利！所有的宝藏都属于你啦！",
    "哇！你的逻辑思维能力简直无懈可击！",
    "太了不起了，你已经成为了顶尖的探险家！"
  ],
  lose: [
    "没关系，伟大的探险家也会遇到意外。再试一次就好！",
    "哎呀，不小心碰到了。深呼吸，下一局一定能成功！",
    "失败是成功之母，我已经看到你变强了！加油！",
    "不要灰心，刚才你已经做得很棒了，再来一局吧！"
  ],
  hint: [
    "小提示：方块上的数字代表它周围 8 个格子里的地雷数量哦！",
    "看！如果数字是 1，说明它周围只有一个坏地雷。",
    "先点开角落的方块，也许会有意想不到的好运！",
    "如果你确定哪里有雷，记得长按插上一面小红旗。"
  ]
};
