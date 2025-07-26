import { TeamID } from "../types";

interface GameOverProps {
  winner: TeamID | null;
  onRestart: () => void;
  challengerWager?: string | null;
  opponentWager?: string | null;
}

export default function GameOver({ winner, onRestart, challengerWager, opponentWager }: GameOverProps) {
  
  const challengerWagerNum = Number(challengerWager);
  const opponentWagerNum = Number(opponentWager);
  const totalWager = !isNaN(challengerWagerNum) && !isNaN(opponentWagerNum) 
    ? challengerWagerNum + opponentWagerNum 
    : null;

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-4xl font-bold mb-4">Game Over</h2>
      <p className="text-2xl mb-2">
        {winner ? `Team ${winner} wins!` : "It's a draw!"}
      </p>
      {winner && totalWager !== null && (
        <p className="text-lg text-emerald-600 mb-6">
            Team {winner} has won the pot of {totalWager} points.
        </p>
      )}
      <button
        onClick={onRestart}
        className="bg-blue-600 text-white py-2 px-6 rounded text-lg hover:bg-blue-700 transition"
      >
        Play Again
      </button>
    </div>
  );
}