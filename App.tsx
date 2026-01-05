
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, GameStatus, CellData } from './types';
import { DIFFICULTY_CONFIGS, THEME_ICONS, LOCAL_MESSAGES } from './constants';
import { createBoard, plantMines, revealCell, checkWin } from './utils/gameLogic';
import { audioService } from './services/audioService';
import Cell from './components/Cell';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [board, setBoard] = useState<CellData[][]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.READY);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [aiMessage, setAiMessage] = useState(LOCAL_MESSAGES.start[0]);
  const [explodedCell, setExplodedCell] = useState<{r: number, c: number} | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const config = DIFFICULTY_CONFIGS[difficulty];

  // 辅助函数：随机获取本地话术
  const getRandomMessage = (type: keyof typeof LOCAL_MESSAGES) => {
    const msgs = LOCAL_MESSAGES[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const initGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus(GameStatus.READY);
    setBoard(createBoard(config));
    setFlagsUsed(0);
    setTimer(0);
    setExplodedCell(null);
    setShowResultOverlay(false);
    setIsProcessing(false);
    setAiMessage(getRandomMessage('start'));
  }, [config]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  const handleCellClick = (r: number, c: number) => {
    if (isProcessing) return;
    if (status === GameStatus.WON || status === GameStatus.LOST) {
      if (!showResultOverlay) setShowResultOverlay(true);
      return;
    }
    if (board[r][c].isFlagged || board[r][c].isRevealed) return;

    setIsProcessing(true);
    let currentStatus = status;
    let newBoard = board.map(row => row.map(cell => ({ ...cell })));
    
    // 第一次点击，种植地雷
    if (currentStatus === GameStatus.READY) {
      plantMines(newBoard, config.mines, { r, c });
      currentStatus = GameStatus.PLAYING;
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
      if (timerRef.current) clearInterval(timerRef.current);
      audioService.playLose();
      
      setAiMessage(getRandomMessage('lose'));
      
      // 揭开所有地雷
      const finalBoard = newBoard.map(row => row.map(cell => {
        if (cell.isMine) return { ...cell, isRevealed: true };
        return cell;
      }));
      setBoard(finalBoard);
      
      // 稍微延迟显示结算界面，让孩子看清爆炸点
      setTimeout(() => setShowResultOverlay(true), 1500);
    } else {
      if (checkWin(newBoard)) {
        setStatus(GameStatus.WON);
        setShowResultOverlay(true);
        if (timerRef.current) clearInterval(timerRef.current);
        audioService.playWin();
        setAiMessage(getRandomMessage('win'));
      }
      setBoard(newBoard);
    }
    setIsProcessing(false);
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (isProcessing || (status !== GameStatus.PLAYING && status !== GameStatus.READY)) return;
    if (board[r][c].isRevealed) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const cell = newBoard[r][c];
    
    if (!cell.isFlagged && flagsUsed >= config.mines) return;

    audioService.playFlag();
    cell.isFlagged = !cell.isFlagged;
    setFlagsUsed(prev => cell.isFlagged ? prev + 1 : prev - 1);
    setBoard(newBoard);
  };

  const handleGetHint = () => {
    setAiMessage(getRandomMessage('hint'));
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center p-4">
      {/* Header Section */}
      <header className="text-center mb-6 pt-4">
        <h1 className="text-4xl font-black text-indigo-800 drop-shadow-sm mb-2">
          小小英雄：扫雷大冒险 💣
        </h1>
        <p className="text-indigo-600/80 text-lg">
          动脑筋，找宝藏，避开危险的小地雷！
        </p>
      </header>

      {/* Stats Board */}
      <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-8 flex flex-wrap justify-around items-center gap-6 w-full max-w-xl border-4 border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-2xl text-3xl">🚩</div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">剩余标记</span>
            <span className="text-3xl font-black text-red-500 tabular-nums">{config.mines - flagsUsed}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-2xl text-3xl">⏱️</div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">计时器</span>
            <span className="text-3xl font-black text-indigo-600 tabular-nums">{timer}s</span>
          </div>
        </div>

        <button 
          onClick={initGame}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-2xl shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none transition-all text-lg"
        >
          重新开始
        </button>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-3 mb-8 bg-white/50 p-2 rounded-2xl backdrop-blur-sm">
        {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-5 py-2 rounded-xl font-black transition-all ${
              difficulty === d 
                ? 'bg-indigo-600 text-white scale-105 shadow-lg' 
                : 'text-indigo-600 hover:bg-white/80'
            }`}
          >
            {DIFFICULTY_CONFIGS[d].label}
          </button>
        ))}
      </div>

      {/* Game Board Container */}
      <div className="relative p-4 bg-indigo-800 rounded-3xl shadow-[0_15px_50px_rgba(49,46,129,0.4)]">
        <div 
          className="grid gap-1.5"
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

        {/* Overlay for Win/Loss */}
        {showResultOverlay && (
          <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-md flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-300 z-20">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-b-[10px] border-indigo-100 transform scale-100">
                <span className="text-8xl mb-6 block animate-bounce">
                  {status === GameStatus.WON ? THEME_ICONS.WIN : THEME_ICONS.LOSE}
                </span>
                <h2 className="text-4xl font-black text-slate-800 mb-8">
                  {status === GameStatus.WON ? '你太棒了！' : '再来一次吗？'}
                </h2>
                <button 
                  onClick={initGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl text-2xl font-black shadow-[0_6px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none transition-all"
                >
                  继续挑战
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Local Mentor Section */}
      <div className="mt-10 w-full max-w-xl">
        <div className="bg-white border-4 border-amber-300 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -mr-12 -mt-12 opacity-50"></div>
          <div className="bg-amber-400 p-4 rounded-3xl text-4xl shadow-inner relative z-10">🧙‍♂️</div>
          <div className="flex-1 relative z-10">
            <h3 className="text-amber-800 text-xl font-black mb-2">智慧导师</h3>
            <p className="text-slate-700 text-lg leading-relaxed font-bold">
              "{aiMessage}"
            </p>
          </div>
          <button 
            onClick={handleGetHint}
            className="absolute top-4 right-4 bg-amber-50 border-2 border-amber-200 p-3 rounded-full shadow hover:bg-amber-100 transition-all active:scale-95"
            title="寻求提示"
          >
            💡
          </button>
        </div>
      </div>

      <footer className="mt-12 text-slate-400 font-bold">
        长按/右键可以插上小红旗标记地雷哦！🚩
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          75% { transform: translateX(4px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
