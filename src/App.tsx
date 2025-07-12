import { useGowapGame } from './hooks/useGowapGame';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';
import './App.css';

function App() {
  const { gameState, initializeGame, nextTurn, resetGame } = useGowapGame();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Gowap</h1>
        <p className="text-lg text-gray-600">The Game of War and Peace</p>
      </header>

      <main className="max-w-7xl mx-auto">
        {!gameState ? (
          <GameSetup onSetupComplete={initializeGame} />
        ) : (
          <>
            {gameState.isGameOver ? (
              <GameOver winner={gameState.winner} onRestart={resetGame} />
            ) : (
              <div>
                <GameControls onNextTurn={nextTurn} turn={gameState.turn} onReset={resetGame}/>
                <GameBoard grid={gameState.grid} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;