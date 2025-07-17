import clsx from 'clsx';
import { Marble as MarbleType } from '../types';

interface MarbleProps {
  marble: MarbleType;
  showAllData: boolean;
}

export default function Marble({ marble, showAllData }: MarbleProps) {
  const teamColor = marble.team === 'A' ? 'bg-blue-500' : 'bg-red-500';
  const genderSymbol = marble.gender === 'M' ? '♂' : '♀';

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={clsx(
          "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md m-1",
          teamColor
        )}
        title={`Team ${marble.team} | In: ${marble.inputValue.toFixed(2)}, Pre: ${marble.preFuncValue.toFixed(2)}, Out: ${marble.outputValue.toFixed(2)}`}
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
