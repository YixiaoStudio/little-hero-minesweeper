
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
    if (data.isFlagged) return THEME_ICONS.FLAG;
    if (!data.isRevealed) return '';
    if (data.isMine) {
      return isExploded ? (
        <div className="relative flex items-center justify-center">
          <span>{THEME_ICONS.MINE}</span>
          <span className="absolute text-red-600 text-3xl font-black drop-shadow-md select-none">{THEME_ICONS.EXPLODED}</span>
        </div>
      ) : THEME_ICONS.MINE;
    }
    return data.neighborCount > 0 ? data.neighborCount : THEME_ICONS.SAFE;
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '', 'text-blue-600', 'text-green-600', 'text-red-500', 
      'text-indigo-700', 'text-amber-800', 'text-cyan-700', 'text-black', 'text-gray-500'
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
        rounded-sm text-xl font-black transition-all duration-150 transform
        ${!data.isRevealed 
          ? `${isDark ? 'bg-indigo-500' : 'bg-indigo-400'} hover:bg-indigo-300 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]` 
          : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]'
        }
        ${isExploded ? 'bg-red-400 z-10 scale-110 shadow-2xl' : ''}
        ${data.isRevealed && data.isMine && !isExploded ? 'bg-red-100' : ''}
      `}
    >
      <span className={data.isRevealed && !data.isMine ? getNumberColor(data.neighborCount) : ''}>
        {getCellContent()}
        {!data.isRevealed && !data.isFlagged && <span className="text-sm opacity-30 select-none">{THEME_ICONS.HIDDEN}</span>}
      </span>
    </div>
  );
};

export default Cell;
