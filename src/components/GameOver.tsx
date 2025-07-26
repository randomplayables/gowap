import { TeamID, TerminationReason } from "../types";

interface GameOverProps {
  winner: TeamID | null;
  onRestart: () => void;
  challengerWager?: string | null;
  opponentWager?: string | null;
  terminationReason?: TerminationReason;
}

export default function GameOver({ winner, onRestart, challengerWager, opponentWager, terminationReason }: GameOverProps) {
  
  const challengerWagerNum = Number(challengerWager);
  const opponentWagerNum = Number(opponentWager);
  const totalWager = !isNaN(challengerWagerNum) && !isNaN(opponentWagerNum) 
    ? challengerWagerNum + opponentWagerNum 
    : null;

  const isAbandonment = terminationReason === 'abandonment';

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-4xl font-bold mb-4">
        {isAbandonment ? 'Match Concluded' : 'Game Over'}
      </h2>
      
      {isAbandonment ? (
        <p className="text-xl mb-6 text-yellow-700">
          This match was resolved on the platform because the opponent reported an abandonment.
        </p>
      ) : (
        <>
          <p className="text-2xl mb-2">
            {winner ? `Team ${winner} wins!` : "It's a draw!"}
          </p>
          {winner && totalWager !== null && (
            <p className="text-lg text-emerald-600 mb-6">
                Team {winner} has won the pot of {totalWager} points.
            </p>
          )}
        </>
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