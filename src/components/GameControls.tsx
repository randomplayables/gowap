import clsx from 'clsx';

interface GameControlsProps {
    onNextTurn: () => void;
    onReset: () => void;
    turn: number;
    isBattlePending?: boolean;
    isAutoPlayActive: boolean;
    onToggleAutoPlay: () => void;
    autoPlaySpeed: number;
    onAutoPlaySpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  export default function GameControls({ 
    onNextTurn, 
    turn, 
    onReset, 
    isBattlePending,
    isAutoPlayActive,
    onToggleAutoPlay,
    autoPlaySpeed,
    onAutoPlaySpeedChange
  }: GameControlsProps) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center my-4 p-4 bg-white rounded-lg shadow-md space-y-4 sm:space-y-0">
        <h3 className="text-xl font-semibold">Turn: {turn}</h3>
        
        <div className="flex items-center space-x-2">
            <label htmlFor="speed-slider" className="text-sm font-medium">Speed:</label>
            <input 
                id="speed-slider"
                type="range" 
                min="100" 
                max="2000" 
                step="50"
                value={autoPlaySpeed}
                onChange={onAutoPlaySpeedChange}
                disabled={isAutoPlayActive}
                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm w-12 text-left">{autoPlaySpeed}ms</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onToggleAutoPlay} 
            className={clsx(
              "text-white p-2 rounded transition-colors w-32",
              isAutoPlayActive 
                ? "bg-yellow-500 hover:bg-yellow-600" 
                : "bg-indigo-500 hover:bg-indigo-600"
            )}
          >
            {isAutoPlayActive ? 'Stop Auto-Play' : 'Start Auto-Play'}
          </button>
          <button onClick={onReset} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
            Reset Game
          </button>
          <button 
            onClick={onNextTurn} 
            disabled={isAutoPlayActive}
            className={clsx(
              "text-white p-2 rounded transition-colors w-32",
              isBattlePending 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700",
              isAutoPlayActive && "bg-gray-400 cursor-not-allowed"
            )}
          >
            {isBattlePending ? 'Resolve Battles' : 'Next Turn'}
          </button>
        </div>
      </div>
    );
  }
