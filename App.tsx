
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, GameStatus, CellData } from './types';
import { DIFFICULTY_CONFIGS, THEME_ICONS } from './constants';
import { createBoard, plantMines, revealCell, checkWin } from './utils/gameLogic';
import { audioService } from './services/audioService';
import { getEncouragement } from './services/geminiService';
import Cell from './components/Cell';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [board, setBoard] = useState<CellData[][]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.READY);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [aiMessage, setAiMessage] = useState('你好，勇敢的排雷小英雄！点击方块开始你的挑战吧！');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [explodedCell, setExplodedCell] = useState<{r: number, c: number} | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  const config = DIFFICULTY_CONFIGS[difficulty];

  const initGame = useCallback(async () => {
    const newBoard = createBoard(config);
    setBoard(newBoard);
    setStatus(GameStatus.READY);
    setFlagsUsed(0);
    setTimer(0);
    setExplodedCell(null);
    setShowResultOverlay(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsAiLoading(true);
    const msg = await getEncouragement('start');
    setAiMessage(msg);
    setIsAiLoading(false);
  }, [config]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  const handleCellClick = async (r: number, c: number) => {
    // 如果已经赢了，且显示了结算层，点击无效
    if (status === GameStatus.WON && showResultOverlay) return;

    // 如果已经输了，再次点击任何地方显示重新开始的弹窗
    if (status === GameStatus.LOST) {
      if (!showResultOverlay) {
        setShowResultOverlay(true);
      }
      return;
    }

    if (board[r][c].isFlagged || board[r][c].isRevealed) return;

    let newBoard = [...board.map(row => row.map(cell => ({ ...cell })))];
    
    if (status === GameStatus.READY) {
      plantMines(newBoard, config.mines, { r, c });
      setStatus(GameStatus.PLAYING);
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }

    audioService.playPop();
    const hitMine = revealCell(newBoard, r, c);

    if (hitMine) {
      setExplodedCell({ r, c });
      setStatus(GameStatus.LOST);
      setShowResultOverlay(false); // 初始不显示结算层，只显示地图上的X
      if (timerRef.current) clearInterval(timerRef.current);
      audioService.playLose();
      
      // 揭开所有地雷
      newBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      
      setIsAiLoading(true);
      const msg = await getEncouragement('lose');
      setAiMessage(msg);
      setIsAiLoading(false);
    } else if (checkWin(newBoard)) {
      setStatus(GameStatus.WON);
      setShowResultOverlay(true); // 赢了直接显示
      if (timerRef.current) clearInterval(timerRef.current);
      audioService.playWin();
      
      setIsAiLoading(true);
      const msg = await getEncouragement('win');
      setAiMessage(msg);
      setIsAiLoading(false);
    }

    setBoard(newBoard);
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status !== GameStatus.PLAYING && status !== GameStatus.READY) return;
    if (board[r][c].isRevealed) return;

    const newBoard = [...board.map(row => row.map(cell => ({ ...cell })))];
    const cell = newBoard[r][c];
    
    if (!cell.isFlagged && flagsUsed >= config.mines) return;

    audioService.playFlag();
    cell.isFlagged = !cell.isFlagged;
    setFlagsUsed(prev => cell.isFlagged ? prev + 1 : prev - 1);
    setBoard(newBoard);
  };

  const handleGetHint = async () => {
    setIsAiLoading(true);
    const msg = await getEncouragement('hint');
    setAiMessage(msg);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      {/* Header Section */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-black text-indigo-700 drop-shadow-sm mb-2">
          小小英雄：扫雷挑战 💣
        </h1>
        <p className="text-slate-500 text-lg">
          动脑思考，避开危险地雷，赢得排雷勋章！
        </p>
      </header>

      {/* Stats Board */}
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 flex flex-wrap justify-around gap-4 w-full max-w-xl border-4 border-indigo-100">
        <div className="flex items-center gap-2">
          <span className="text-3xl">💣</span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase font-bold">剩余地雷</span>
            <span className="text-2xl font-black text-red-500">{config.mines - flagsUsed}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-3xl">⏳</span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase font-bold">用时</span>
            <span className="text-2xl font-black text-indigo-500">{timer}s</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <button 
             onClick={initGame}
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 text-lg"
           >
             立即重开
           </button>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              difficulty === d 
                ? 'bg-indigo-600 text-white scale-105 shadow-md' 
                : 'bg-white text-indigo-600 border-2 border-indigo-100'
            }`}
          >
            {DIFFICULTY_CONFIGS[d].label}
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative p-3 bg-indigo-900 rounded-lg shadow-2xl">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => 
            row.map((cell, c) => (
              <Cell 
                key={`${r}-${c}`}
                data={cell}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleContextMenu(e, r, c)}
                gameStatus={status}
                isExploded={explodedCell?.r === r && explodedCell?.c === c}
              />
            ))
          )}
        </div>

        {/* Overlay for Win/Loss - Only show when showResultOverlay is true */}
        {showResultOverlay && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-lg animate-fade-in z-20">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-b-8 border-indigo-200 transform scale-90 sm:scale-100">
                <span className="text-7xl mb-4 block">
                  {status === GameStatus.WON ? THEME_ICONS.WIN : THEME_ICONS.LOSE}
                </span>
                <h2 className="text-3xl font-black text-slate-800 mb-6">
                  {status === GameStatus.WON ? '伟大的胜利！' : '哎呀，挑战失败了'}
                </h2>
                <button 
                  onClick={initGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-xl active:scale-95"
                >
                  开始新挑战
                </button>
             </div>
          </div>
        )}
      </div>

      {/* AI Assistant Section */}
      <div className="mt-8 w-full max-w-xl">
        <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-6 flex items-start gap-4 shadow-lg relative">
          <div className="bg-amber-400 p-2 rounded-full text-3xl shadow-md">🧙‍♂️</div>
          <div className="flex-1">
            <h3 className="text-amber-800 font-black mb-1 flex items-center gap-2">
              智慧导师
              {isAiLoading && <span className="inline-block w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>}
            </h3>
            <p className="text-amber-900 italic leading-relaxed font-medium">
              "{aiMessage}"
            </p>
          </div>
          <button 
            onClick={handleGetHint}
            disabled={isAiLoading || status !== GameStatus.PLAYING}
            className={`absolute -top-4 -right-4 bg-white border-2 border-amber-300 p-3 rounded-full shadow-lg hover:bg-amber-100 transition-colors ${status !== GameStatus.PLAYING ? 'opacity-50 grayscale' : ''}`}
            title="寻求提示"
          >
            💡
          </button>
        </div>
      </div>

      {/* Help Note */}
      <footer className="mt-12 text-sm text-slate-400 max-w-md text-center">
        <p>游戏指南：踩到地雷后，它会打上红色的叉号。此时你可以点击任意位置来重新开始游戏。加油！</p>
      </footer>
    </div>
  );
};

export default App;
