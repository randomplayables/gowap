import clsx from 'clsx';
import { Grid } from '../types';
import Marble from './Marble';

interface GameBoardProps {
  grid: Grid;
  showAllData: boolean;
}

export default function GameBoard({ grid, showAllData }: GameBoardProps) {
  const gridSize = grid.length;

  return (
    <div className="bg-gray-200 p-2 rounded-lg shadow-inner">
      <div
        className="grid border-gray-400"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          aspectRatio: '1 / 1',
        }}
      >
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={clsx(
              "border border-gray-300 flex items-center justify-center relative aspect-square transition-colors",
              cell.hasBattle && "bg-red-200 animate-pulse"
            )}
            title={`Function: ${cell.func}`}
          >
            {cell.marbles.map(marble => (
              <Marble key={marble.id} marble={marble} showAllData={showAllData} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}