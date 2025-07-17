import { useState, useEffect } from 'react';
import { useGowapGame } from './hooks/useGowapGame';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';
import './App.css';

function App() {
  const { gameState, initializeGame, nextTurn, resetGame, isProcessingTurn } = useGowapGame();
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000);
  const [showAllData, setShowAllData] = useState(false);

  useEffect(() => {
    if (!isAutoPlayActive || !gameState || gameState.isGameOver || isProcessingTurn) {
      return;
    }

    const timer = setTimeout(() => {
      nextTurn();
    }, autoPlaySpeed);

    return () => clearTimeout(timer);
  }, [isAutoPlayActive, autoPlaySpeed, gameState, nextTurn, isProcessingTurn]);

  const toggleAutoPlay = () => {
    setIsAutoPlayActive(prev => !prev);
  };

  const handleAutoPlaySpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPlaySpeed(Number(e.target.value));
  };

  const handleReset = () => {
    setIsAutoPlayActive(false);
    setShowAllData(false);
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
                  isProcessingTurn={isProcessingTurn}
                  isAutoPlayActive={isAutoPlayActive}
                  onToggleAutoPlay={toggleAutoPlay}
                  autoPlaySpeed={autoPlaySpeed}
                  onAutoPlaySpeedChange={handleAutoPlaySpeedChange}
                  showAllData={showAllData}
                  onToggleShowAllData={() => setShowAllData(prev => !prev)}
                />
                <GameBoard 
                    grid={gameState.grid} 
                    showAllData={showAllData} 
                    isEventVisualizing={gameState.isEventVisualizing}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;