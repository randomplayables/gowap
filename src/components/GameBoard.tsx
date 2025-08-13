import clsx from 'clsx';
import { Grid } from '../types';
import Marble from './Marble';

interface GameBoardProps {
  grid: Grid;
  turn: number;
  showAllData: boolean;
  isEventVisualizing: boolean;
}

export default function GameBoard({ grid, turn, showAllData, isEventVisualizing }: GameBoardProps) {
  const gridSize = grid.length;

  return (
    <div className="max-w-2xl mx-auto">
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
                "border border-gray-300 flex flex-wrap items-center justify-center relative aspect-square transition-colors p-1", // Added flex-wrap and padding
                isEventVisualizing && {
                  "bg-red-300 animate-pulse": cell.event === 'battle',
                  "bg-purple-300 animate-pulse": cell.event === 'reproduction',
                }
              )}
              title={`Function: ${cell.func}`}
            >
              {cell.marbles.map(marble => (
                <Marble key={marble.id} marble={marble} turn={turn} showAllData={showAllData} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}