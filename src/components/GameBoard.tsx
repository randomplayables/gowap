import { Grid } from '../types';
import Marble from './Marble';

interface GameBoardProps {
  grid: Grid;
}

export default function GameBoard({ grid }: GameBoardProps) {
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
            className="border border-gray-300 flex items-center justify-center relative aspect-square"
          >
            {cell.marbles.map(marble => (
              <Marble key={marble.id} marble={marble} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}