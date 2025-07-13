import clsx from 'clsx';

interface GameControlsProps {
    onNextTurn: () => void;
    onReset: () => void;
    turn: number;
    isBattlePending?: boolean;
  }
  
  export default function GameControls({ onNextTurn, turn, onReset, isBattlePending }: GameControlsProps) {
    return (
      <div className="flex justify-between items-center my-4 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">Turn: {turn}</h3>
        <div>
          <button onClick={onReset} className="bg-gray-500 text-white p-2 rounded mr-2 hover:bg-gray-600">
            Reset Game
          </button>
          <button 
            onClick={onNextTurn} 
            className={clsx(
              "text-white p-2 rounded transition-colors",
              isBattlePending 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {isBattlePending ? 'Resolve Battles' : 'Next Turn'}
          </button>
        </div>
      </div>
    );
  }