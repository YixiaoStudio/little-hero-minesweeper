
import React from 'react';
import { CellData } from '../types';
import { THEME_ICONS } from '../constants';

interface CellProps {
  data: CellData;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  gameStatus: string;
  isExploded: boolean;
}

const Cell: React.FC<CellProps> = ({ data, onClick, onContextMenu, gameStatus, isExploded }) => {
  const getCellContent = () => {
    if (data.isFlagged) return <span className="animate-bounce inline-block">{THEME_ICONS.FLAG}</span>;
    if (!data.isRevealed) return '';
    if (data.isMine) {
      return isExploded ? (
        <div className="relative flex items-center justify-center animate-ping">
          <span>{THEME_ICONS.MINE}</span>
          <span className="absolute text-red-600 text-3xl font-black drop-shadow-md select-none">{THEME_ICONS.EXPLODED}</span>
        </div>
      ) : (
        <span className="opacity-80 scale-90">{THEME_ICONS.MINE}</span>
      );
    }
    return data.neighborCount > 0 ? data.neighborCount : THEME_ICONS.SAFE;
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '', 'text-blue-500', 'text-green-500', 'text-red-500', 
      'text-indigo-600', 'text-amber-700', 'text-teal-600', 'text-black', 'text-gray-500'
    ];
    return colors[num] || 'text-gray-500';
  };

  const isDark = (data.x + data.y) % 2 === 0;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer
        rounded-md text-xl font-black transition-all duration-200 transform select-none
        ${!data.isRevealed 
          ? `${isDark ? 'bg-indigo-500' : 'bg-indigo-400'} hover:bg-indigo-300 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)] active:scale-90 active:translate-y-1` 
          : 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]'
        }
        ${isExploded ? 'bg-red-500 z-10 scale-125 shadow-2xl animate-shake' : ''}
        ${data.isRevealed && data.isMine && !isExploded ? 'bg-orange-100' : ''}
      `}
    >
      <span className={data.isRevealed && !data.isMine ? getNumberColor(data.neighborCount) : ''}>
        {getCellContent()}
      </span>
    </div>
  );
};

export default Cell;
