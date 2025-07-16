import { useState, useEffect } from 'react';
import { useGowapGame } from './hooks/useGowapGame';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';
import './App.css';

function App() {
  const { gameState, initializeGame, nextTurn, resetGame } = useGowapGame();
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000); // Default speed: 1 second
  const [showAllData, setShowAllData] = useState(false);

  // Effect to handle the auto-play game loop
  useEffect(() => {
    // Do nothing if auto-play is not active or the game is over
    if (!isAutoPlayActive || !gameState || gameState.isGameOver) {
      return;
    }

    // Set up an interval to call nextTurn at the specified speed
    const intervalId = setInterval(() => {
      nextTurn();
    }, autoPlaySpeed);

    // Cleanup function to clear the interval when the component unmounts
    // or when the dependencies of the effect change
    return () => clearInterval(intervalId);
  }, [isAutoPlayActive, autoPlaySpeed, gameState, nextTurn]);

  const toggleAutoPlay = () => {
    setIsAutoPlayActive(prev => !prev);
  };

  const handleAutoPlaySpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPlaySpeed(Number(e.target.value));
  };

  const handleReset = () => {
    setIsAutoPlayActive(false); // Stop auto-play on reset
    setShowAllData(false); // Hide data on reset
    resetGame();
  };

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
              <GameOver winner={gameState.winner} onRestart={handleReset} />
            ) : (
              <div>
                <GameControls 
                  onNextTurn={nextTurn} 
                  turn={gameState.turn} 
                  onReset={handleReset}
                  isBattlePending={gameState.battlePending}
                  isAutoPlayActive={isAutoPlayActive}
                  onToggleAutoPlay={toggleAutoPlay}
                  autoPlaySpeed={autoPlaySpeed}
                  onAutoPlaySpeedChange={handleAutoPlaySpeedChange}
                  showAllData={showAllData}
                  onToggleShowAllData={() => setShowAllData(prev => !prev)}
                />
                <GameBoard grid={gameState.grid} showAllData={showAllData} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;