import { TeamID } from "../types";

interface GameOverProps {
  winner: TeamID | null;
  onRestart: () => void;
}

export default function GameOver({ winner, onRestart }: GameOverProps) {
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-4xl font-bold mb-4">Game Over</h2>
      <p className="text-2xl mb-6">
        {winner ? `Team ${winner} wins!` : "It's a draw!"}
      </p>
      <button
        onClick={onRestart}
        className="bg-blue-600 text-white py-2 px-6 rounded text-lg hover:bg-blue-700 transition"
      >
        Play Again
      </button>
    </div>
  );
}