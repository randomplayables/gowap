import { useState, useEffect, useRef } from 'react';
import { useGowapGame } from './hooks/useGowapGame';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameOver from './components/GameOver';
import './App.css';
import { GameModeType } from './types'; // Import the new type

function App() {
  const { gameState, initializeGame, initializeGauntletGame, nextTurn, isProcessingTurn } = useGowapGame();
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000);
  const [showAllData, setShowAllData] = useState(false);
  const [gameMode, setGameMode] = useState<GameModeType | null>(null);
  const [isLoadingGauntlet, setIsLoadingGauntlet] = useState(false);
  const gauntletInitCalled = useRef(false); // Ref to prevent re-running initialization

  // Check for Gauntlet mode from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gauntletMode = urlParams.get('gauntlet_mode');
    
    if (gauntletMode === 'create' || gauntletMode === 'accept' || gauntletMode === 'play') {
        setGameMode('gauntlet');
        if (gauntletMode === 'play' && !gauntletInitCalled.current) {
            const gauntletId = urlParams.get('gauntletId');
            if (gauntletId) {
                gauntletInitCalled.current = true; // Set the flag to true
                setIsLoadingGauntlet(true);
                initializeGauntletGame(gauntletId).finally(() => {
                    setIsLoadingGauntlet(false);
                });
            }
        }
    }
  }, [initializeGauntletGame]); // Dependency array is now stable

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
    // This will force a reload to clear URL params for a clean reset
    window.location.href = window.location.pathname;
  };
  
  const renderContent = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gauntletModeParam = urlParams.get('gauntlet_mode');

    // If a game is active, render the board/game over screen
    if (gameState) {
      return gameState.isGameOver ? (
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
              turn={gameState.turn}
              showAllData={showAllData} 
              isEventVisualizing={gameState.isEventVisualizing}
          />
        </div>
      );
    }

    // If launched directly into a gauntlet mode from URL
    if (gauntletModeParam === 'create') {
        return <GameSetup onSetupComplete={initializeGame} mode="gauntlet-create" />;
    }
    if (gauntletModeParam === 'accept') {
        return <GameSetup onSetupComplete={initializeGame} mode="gauntlet-accept" />;
    }
    if (gauntletModeParam === 'play') {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Loading Gauntlet Match...</h2>
                {isLoadingGauntlet && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>}
            </div>
        );
    }

    // If no game is active, check the selected mode from the UI
    switch (gameMode) {
      case 'single-player':
        return <GameSetup onSetupComplete={initializeGame} mode="single-player" />;
      case 'gauntlet':
        // This state is now mainly for navigating to the platform, but we can keep a placeholder
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Gauntlet Mode</h2>
                <p>Please create or accept challenges on the RandomPlayables platform.</p>
                <button onClick={() => setGameMode(null)} className="mt-4 text-sm text-blue-600 hover:underline">Back</button>
            </div>
        );
      default:
        // If no mode is selected, show the selection screen
        const platformUrl = import.meta.env.VITE_PLATFORM_URL || 'https://randomplayables.com';
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold mb-6">Choose Game Mode</h2>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <button onClick={() => setGameMode('single-player')} className="w-64 bg-blue-600 text-white py-3 px-6 rounded text-lg hover:bg-blue-700 transition">
                        Single Player
                    </button>
                    {/* This button now navigates to the platform's gauntlet page */}
                    <a href={`${platformUrl}/gauntlet`} target="_top" className="w-64 bg-purple-600 text-white py-3 px-6 rounded text-lg hover:bg-purple-700 transition">
                        Gauntlet Mode
                    </a>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Gowap</h1>
        <p className="text-lg text-gray-600">The Game of War and Peace</p>
      </header>

      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;