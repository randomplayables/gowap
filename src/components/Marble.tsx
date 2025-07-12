import clsx from 'clsx';
import { Marble as MarbleType } from '../types';

interface MarbleProps {
  marble: MarbleType;
}

export default function Marble({ marble }: MarbleProps) {
  const teamColor = marble.team === 'A' ? 'bg-blue-500' : 'bg-red-500';
  const genderSymbol = marble.gender === 'M' ? '♂' : '♀';

  return (
    <div
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md m-1",
        teamColor
      )}
      title={`Team ${marble.team} | Value: ${marble.outputValue.toFixed(2)}`}
    >
      {genderSymbol}
    </div>
  );
}