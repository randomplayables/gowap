import clsx from 'clsx';
import { Marble as MarbleType } from '../types';

interface MarbleProps {
  marble: MarbleType;
  turn: number;
  showAllData: boolean;
}

export default function Marble({ marble, turn, showAllData }: MarbleProps) {
  const teamColor = marble.team === 'A' ? 'bg-blue-500' : 'bg-red-500';
  const genderSymbol = marble.gender === 'M' ? '♂' : '♀';

  // Create a more informative and context-aware tooltip
  let tooltipText: string;

  if (turn === 0) {
    // At the start of the game, only the initial value is relevant
    tooltipText = `ID: ${marble.id} | Team ${marble.team}\nInitial Value: ${marble.inputValue.toFixed(2)}`;
  } else {
    // For all subsequent turns, show the full data flow
    tooltipText = `ID: ${marble.id} | Team ${marble.team}\nIn: ${marble.inputValue.toFixed(2)}\nPre: ${marble.preFuncValue.toFixed(2)}\nOut: ${marble.outputValue.toFixed(2)}`;
  }

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={clsx(
          "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md m-1",
          teamColor
        )}
        title={tooltipText}
      >
        {genderSymbol}
      </div>
      {showAllData && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none">
          Out: {marble.outputValue.toFixed(2)}
        </div>
      )}
    </div>
  );
}