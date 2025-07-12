interface GameControlsProps {
    onNextTurn: () => void;
    onReset: () => void;
    turn: number;
  }
  
  export default function GameControls({ onNextTurn, turn, onReset }: GameControlsProps) {
    return (
      <div className="flex justify-between items-center my-4 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">Turn: {turn}</h3>
        <div>
          <button onClick={onReset} className="bg-gray-500 text-white p-2 rounded mr-2 hover:bg-gray-600">
            Reset Game
          </button>
          <button onClick={onNextTurn} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Next Turn
          </button>
        </div>
      </div>
    );
  }