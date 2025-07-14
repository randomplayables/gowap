import { useState } from 'react';
import { GameConfig, Gender, MarblePosition } from '../types';
import clsx from 'clsx';

interface GameSetupProps {
  onSetupComplete: (config: GameConfig) => void;
}

const defaultCellFunction = "return x * 1.05;";

export default function GameSetup({ onSetupComplete }: GameSetupProps) {
  const [gridSize, setGridSize] = useState(5);
  const [numMarbles, setNumMarbles] = useState(3);
  const [totalInitialValue] = useState(100);
  const [gameMode, setGameMode] = useState<'Last Standing' | 'Rounds'>('Last Standing');
  const [maxRounds, setMaxRounds] = useState(50);
  const [marbleSettings, setMarbleSettings] = useState<{ initialValue: number; gender: Gender }[]>(
    Array.from({ length: 3 }, () => ({ initialValue: Math.floor(100 / 3), gender: 'M' }))
  );
  
  // New state for function editing
  const [customFunctions, setCustomFunctions] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [currentFunctionBody, setCurrentFunctionBody] = useState(defaultCellFunction);

  // New state for marble placement
  const [teamAPositions, setTeamAPositions] = useState<MarblePosition[]>([]);
  const [teamBPositions, setTeamBPositions] = useState<MarblePosition[]>([]);

  const handleNumMarblesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setNumMarbles(count);
    const initialValue = Math.floor(totalInitialValue / count);
    setMarbleSettings(Array.from({ length: count }, () => ({ initialValue, gender: 'M' })));
    // Reset placements when number of marbles changes
    setTeamAPositions([]);
    setTeamBPositions([]);
  };

  const handleMarbleSettingChange = (index: number, field: 'initialValue' | 'gender', value: string | number) => {
    const newSettings = [...marbleSettings];
    if (field === 'initialValue') {
      newSettings[index].initialValue = Number(value);
    } else {
      newSettings[index].gender = value as Gender;
    }
    setMarbleSettings(newSettings);
  };
  
  const handleOpenFunctionEditor = (row: number, col: number) => {
    const cellKey = `${row},${col}`;
    setCurrentFunctionBody(customFunctions[cellKey] ?? defaultCellFunction);
    setEditingCell({ row, col });
  };
  
  const handleSaveFunction = () => {
    if (editingCell) {
        const cellKey = `${editingCell.row},${editingCell.col}`;
        const newCustomFunctions = { ...customFunctions, [cellKey]: currentFunctionBody };
        setCustomFunctions(newCustomFunctions);
        setEditingCell(null);
    }
  };

  const handlePlacement = (row: number, col: number) => {
    const position: MarblePosition = { row, col };
    if (row === 0) { // Team A placement
        setTeamAPositions(prev => {
            const isPlaced = prev.some(p => p.row === row && p.col === col);
            if (isPlaced) {
                return prev.filter(p => !(p.row === row && p.col === col));
            } else if (prev.length < numMarbles) {
                return [...prev, position];
            }
            return prev;
        });
    } else if (row === gridSize - 1) { // Team B placement
        setTeamBPositions(prev => {
            const isPlaced = prev.some(p => p.row === row && p.col === col);
            if (isPlaced) {
                return prev.filter(p => !(p.row === row && p.col === col));
            } else if (prev.length < numMarbles) {
                return [...prev, position];
            }
            return prev;
        });
    }
  };

  const currentTotal = marbleSettings.reduce((sum, s) => sum + s.initialValue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTotal !== totalInitialValue) {
        alert(`The sum of marble values must be exactly ${totalInitialValue}.`);
        return;
    }
    if (teamAPositions.length !== numMarbles || teamBPositions.length !== numMarbles) {
        alert(`Please place all ${numMarbles} marbles for each team.`);
        return;
    }
    onSetupComplete({
      gridSize, numMarbles, totalInitialValue, gameMode, maxRounds, marbleSettings, customFunctions, teamAPositions, teamBPositions
    });
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Game Setup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid Size */}
          <div>
            <label className="block text-sm font-medium">Grid Size</label>
            <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full p-2 border rounded">
              <option value={5}>5x5</option>
              <option value={9}>9x9</option>
              <option value={11}>11x11</option>
            </select>
          </div>

          {/* Number of Marbles */}
          <div>
            <label className="block text-sm font-medium">Number of Marbles per Team</label>
            <select value={numMarbles} onChange={handleNumMarblesChange} className="w-full p-2 border rounded">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Marble Settings */}
          <div className="border-t pt-4">
              <h3 className="font-medium">Distribute Initial Value ({totalInitialValue} total)</h3>
              {marbleSettings.map((setting, i) => (
                  <div key={i} className="flex items-center space-x-2 mt-2">
                      <span className="font-mono">M{i+1}:</span>
                      <input type="number" value={setting.initialValue} onChange={(e) => handleMarbleSettingChange(i, 'initialValue', e.target.value)} className="w-1/2 p-1 border rounded"/>
                      <select value={setting.gender} onChange={(e) => handleMarbleSettingChange(i, 'gender', e.target.value)} className="w-1/2 p-1 border rounded">
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                      </select>
                  </div>
              ))}
              <p className={`text-sm mt-2 ${currentTotal !== totalInitialValue ? 'text-red-500' : 'text-green-600'}`}>
                  Current Total: {currentTotal} / {totalInitialValue}
              </p>
          </div>
          
          {/* Game Mode */}
          <div>
            <label className="block text-sm font-medium">Game Mode</label>
            <select value={gameMode} onChange={(e) => setGameMode(e.target.value as any)} className="w-full p-2 border rounded">
              <option value="Last Standing">Last Standing</option>
              <option value="Rounds">Rounds</option>
            </select>
          </div>

          {gameMode === 'Rounds' && (
            <div>
              <label className="block text-sm font-medium">Number of Rounds</label>
              <input type="number" value={maxRounds} onChange={(e) => setMaxRounds(Number(e.target.value))} min="10" max="200" className="w-full p-2 border rounded"/>
            </div>
          )}
          
           {/* Marble Placement */}
           <div className="border-t pt-4">
              <h3 className="font-medium">Marble Placement</h3>
              <p className="text-sm text-gray-500 mb-2">Team A places on the top row, Team B on the bottom. Click to place/remove marbles.</p>
              <p className="text-sm font-bold text-blue-600">Team A Placed: {teamAPositions.length} / {numMarbles}</p>
              <p className="text-sm font-bold text-red-600">Team B Placed: {teamBPositions.length} / {numMarbles}</p>
              <div className="bg-gray-100 p-2 rounded mt-2">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                      {Array.from({length: gridSize * gridSize}).map((_, i) => {
                          const row = Math.floor(i / gridSize);
                          const col = i % gridSize;
                          const isTeamAPlacementZone = row === 0;
                          const isTeamBPlacementZone = row === gridSize - 1;
                          const isAPlaced = teamAPositions.some(p => p.row === row && p.col === col);
                          const isBPlaced = teamBPositions.some(p => p.row === row && p.col === col);

                          const canPlaceA = isTeamAPlacementZone && teamAPositions.length < numMarbles;
                          const canPlaceB = isTeamBPlacementZone && teamBPositions.length < numMarbles;

                          return (
                              <button
                                  type="button"
                                  key={`${row}-${col}`}
                                  onClick={() => handlePlacement(row, col)}
                                  disabled={!isTeamAPlacementZone && !isTeamBPlacementZone}
                                  className={clsx(
                                      "aspect-square rounded text-xs transition-colors",
                                      {
                                          "bg-gray-200": !isTeamAPlacementZone && !isTeamBPlacementZone,
                                          "bg-blue-200 hover:bg-blue-300": isTeamAPlacementZone && !isAPlaced,
                                          "bg-red-200 hover:bg-red-300": isTeamBPlacementZone && !isBPlaced,
                                          "bg-blue-500": isAPlaced,
                                          "bg-red-500": isBPlaced,
                                          "cursor-not-allowed opacity-50": 
                                              (isTeamAPlacementZone && !isAPlaced && !canPlaceA) ||
                                              (isTeamBPlacementZone && !isBPlaced && !canPlaceB)
                                      }
                                  )}
                                  title={`Place marble at (${row},${col})`}
                              >
                                {isAPlaced ? 'A' : isBPlaced ? 'B' : ''}
                              </button>
                          );
                      })}
                  </div>
              </div>
            </div>

          {/* Cell Functions */}
          <div className="border-t pt-4">
            <h3 className="font-medium">Cell Functions (Optional)</h3>
            <p className="text-sm text-gray-500 mb-2">Click a cell to edit its function. `x` is the input value.</p>
            <div className="bg-gray-100 p-2 rounded">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                    {Array.from({length: gridSize * gridSize}).map((_, i) => {
                        const row = Math.floor(i / gridSize);
                        const col = i % gridSize;
                        const hasCustomFunc = !!customFunctions[`${row},${col}`];
                        return (
                            <button
                                type="button"
                                key={`${row}-${col}`}
                                onClick={() => handleOpenFunctionEditor(row, col)}
                                className={clsx(
                                    "aspect-square rounded text-xs transition-colors",
                                    hasCustomFunc ? "bg-indigo-300 hover:bg-indigo-400" : "bg-gray-300 hover:bg-gray-400"
                                )}
                                title={hasCustomFunc ? `Custom f(x) at (${row},${col})` : `Default f(x) at (${row},${col})`}
                            >
                               f(x)
                            </button>
                        );
                    })}
                </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Start Game</button>
        </form>
      </div>

      {/* Function Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Edit Function for Cell ({editingCell.row}, {editingCell.col})</h3>
                <p className="text-sm text-gray-600 mb-2">Enter the body of a JavaScript function. The input value is available as `x`.</p>
                <textarea
                    value={currentFunctionBody}
                    onChange={(e) => setCurrentFunctionBody(e.target.value)}
                    className="w-full h-32 p-2 border rounded bg-gray-50 font-mono text-sm"
                    placeholder="e.g., return x * 1.5;"
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => setEditingCell(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSaveFunction} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Function</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}