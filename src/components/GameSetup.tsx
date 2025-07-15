import { useState, useMemo } from 'react';
import { GameConfig, Gender, MarblePosition, StartZoneType, TeamID } from '../types';
import clsx from 'clsx';

interface GameSetupProps {
  onSetupComplete: (config: GameConfig) => void;
}

const defaultCellFunction = "return x * 1.5 + 1;";

export default function GameSetup({ onSetupComplete }: GameSetupProps) {
  const [gridSize, setGridSize] = useState(5);
  const [numMarbles, setNumMarbles] = useState(4);
  const [totalInitialValue] = useState(100);
  const [gameMode, setGameMode] = useState<'Last Standing' | 'Rounds'>('Last Standing');
  const [maxRounds, setMaxRounds] = useState(50);
  
  // Separate marble settings for each team
  const [teamAMarbleSettings, setTeamAMarbleSettings] = useState<{ initialValue: number; gender: Gender }[]>(
    Array.from({ length: 4 }, () => ({ initialValue: Math.floor(100 / 4), gender: 'M' }))
  );
  const [teamBMarbleSettings, setTeamBMarbleSettings] = useState<{ initialValue: number; gender: Gender }[]>(
    Array.from({ length: 4 }, () => ({ initialValue: Math.floor(100 / 4), gender: 'M' }))
  );

  // Function editing state
  const [customFunctions, setCustomFunctions] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [currentFunctionBody, setCurrentFunctionBody] = useState(defaultCellFunction);

  // Placement and zone configuration state
  const [teamAPositions, setTeamAPositions] = useState<MarblePosition[]>([]);
  const [teamBPositions, setTeamBPositions] = useState<MarblePosition[]>([]);
  const [startZoneConfig, setStartZoneConfig] = useState<Record<string, StartZoneType>>({});
  const [placingTeam, setPlacingTeam] = useState<TeamID>('A');

  const handleNumMarblesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setNumMarbles(count);
    const initialValue = count > 0 ? Math.floor(totalInitialValue / count) : 0;
    const newSettings = Array.from({ length: count }, () => ({ initialValue, gender: 'M' as Gender }));
    setTeamAMarbleSettings(newSettings);
    setTeamBMarbleSettings(newSettings);
    setTeamAPositions([]);
    setTeamBPositions([]);
  };

  const handleMarbleSettingChange = (team: TeamID, index: number, field: 'initialValue' | 'gender', value: string | number) => {
    const setter = team === 'A' ? setTeamAMarbleSettings : setTeamBMarbleSettings;
    setter(prevSettings => {
        const newSettings = [...prevSettings];
        if (field === 'initialValue') {
            newSettings[index].initialValue = Number(value);
        } else {
            newSettings[index].gender = value as Gender;
        }
        return newSettings;
    });
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

  const handleZoneChange = (row: number, col: number) => {
    const cellKey = `${row},${col}`;
    const currentZone = startZoneConfig[cellKey] ?? 'Both';
    const zoneCycle: StartZoneType[] = ['None', 'A', 'B', 'Both'];
    const nextZoneIndex = (zoneCycle.indexOf(currentZone) + 1) % zoneCycle.length;
    const nextZone = zoneCycle[nextZoneIndex];
    setStartZoneConfig(prev => ({ ...prev, [cellKey]: nextZone }));
  };

  const handlePlacement = (row: number, col: number) => {
    const position: MarblePosition = { row, col };
    const cellKey = `${row},${col}`;
    const zoneType = startZoneConfig[cellKey] ?? 'Both';

    const isOccupiedByA = teamAPositions.some(p => p.row === row && p.col === col);
    const isOccupiedByB = teamBPositions.some(p => p.row === row && p.col === col);

    // Determine which team can place here based on zone type and occupation
    const canPlaceA = (zoneType === 'A' || zoneType === 'Both') && !isOccupiedByB;
    const canPlaceB = (zoneType === 'B' || zoneType === 'Both') && !isOccupiedByA;

    // If the currently selected team is 'A' and they are allowed to place here
    if (placingTeam === 'A' && canPlaceA) {
        setTeamAPositions(prev => {
            // If team A already has a marble here, clicking again removes it
            if (isOccupiedByA) {
                return prev.filter(p => !(p.row === row && p.col === col));
            } 
            // If the spot is free for A and the team has marbles left to place, add one
            else if (prev.length < numMarbles) {
                return [...prev, position];
            }
            // Otherwise (team A is full), do nothing
            return prev;
        });
    } 
    // If the currently selected team is 'B' and they are allowed to place here
    else if (placingTeam === 'B' && canPlaceB) {
        setTeamBPositions(prev => {
            // If team B already has a marble here, clicking again removes it
            if (isOccupiedByB) {
                return prev.filter(p => !(p.row === row && p.col === col));
            } 
            // If the spot is free for B and the team has marbles left to place, add one
            else if (prev.length < numMarbles) {
                return [...prev, position];
            }
            // Otherwise (team B is full), do nothing
            return prev;
        });
    }
  };

  const teamACurrentTotal = useMemo(() => teamAMarbleSettings.reduce((sum, s) => sum + s.initialValue, 0), [teamAMarbleSettings]);
  const teamBCurrentTotal = useMemo(() => teamBMarbleSettings.reduce((sum, s) => sum + s.initialValue, 0), [teamBMarbleSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamACurrentTotal !== totalInitialValue) {
        alert(`Team A's sum of marble values must be exactly ${totalInitialValue}.`);
        return;
    }
    if (teamBCurrentTotal !== totalInitialValue) {
        alert(`Team B's sum of marble values must be exactly ${totalInitialValue}.`);
        return;
    }
    if (teamAPositions.length !== numMarbles || teamBPositions.length !== numMarbles) {
        alert(`Please place all ${numMarbles} marbles for each team.`);
        return;
    }
    
    const finalStartZoneConfig = { ...startZoneConfig };
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const key = `${r},${c}`;
            if (!finalStartZoneConfig[key]) {
                finalStartZoneConfig[key] = 'Both';
            }
        }
    }

    const finalCustomFunctions = { ...customFunctions };
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const key = `${r},${c}`;
            if (!finalCustomFunctions[key]) {
                finalCustomFunctions[key] = defaultCellFunction;
            }
        }
    }

    onSetupComplete({
      gridSize, numMarbles, totalInitialValue, gameMode, maxRounds, 
      teamAMarbleSettings, teamBMarbleSettings,
      customFunctions: finalCustomFunctions, 
      teamAPositions, teamBPositions, 
      startZoneConfig: finalStartZoneConfig
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

          {/* Team A Marble Settings */}
          <div className="border-t pt-4">
              <h3 className="font-medium text-blue-600">Team A: Distribute Initial Value ({totalInitialValue} total)</h3>
              {teamAMarbleSettings.map((setting, i) => (
                  <div key={i} className="flex items-center space-x-2 mt-2">
                      <span className="font-mono">M{i+1}:</span>
                      <input type="number" value={setting.initialValue} onChange={(e) => handleMarbleSettingChange('A', i, 'initialValue', e.target.value)} className="w-1/2 p-1 border rounded"/>
                      <select value={setting.gender} onChange={(e) => handleMarbleSettingChange('A', i, 'gender', e.target.value)} className="w-1/2 p-1 border rounded">
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                      </select>
                  </div>
              ))}
              <p className={`text-sm mt-2 ${teamACurrentTotal !== totalInitialValue ? 'text-red-500' : 'text-green-600'}`}>
                  Current Total: {teamACurrentTotal} / {totalInitialValue}
              </p>
          </div>

          {/* Team B Marble Settings */}
          <div className="border-t pt-4">
              <h3 className="font-medium text-red-600">Team B: Distribute Initial Value ({totalInitialValue} total)</h3>
              {teamBMarbleSettings.map((setting, i) => (
                  <div key={i} className="flex items-center space-x-2 mt-2">
                      <span className="font-mono">M{i+1}:</span>
                      <input type="number" value={setting.initialValue} onChange={(e) => handleMarbleSettingChange('B', i, 'initialValue', e.target.value)} className="w-1/2 p-1 border rounded"/>
                      <select value={setting.gender} onChange={(e) => handleMarbleSettingChange('B', i, 'gender', e.target.value)} className="w-1/2 p-1 border rounded">
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                      </select>
                  </div>
              ))}
              <p className={`text-sm mt-2 ${teamBCurrentTotal !== totalInitialValue ? 'text-red-500' : 'text-green-600'}`}>
                  Current Total: {teamBCurrentTotal} / {totalInitialValue}
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
          
          {/* Step A: Configure Start Zones */}
          <div className="border-t pt-4">
              <h3 className="font-medium">Step 1: Configure Start Zones</h3>
              <p className="text-sm text-gray-500 mb-2">Click a cell to set its starting permission: Grey (None), Blue (Team A), Red (Team B), or Green (Anyone).</p>
              <div className="bg-gray-100 p-2 rounded mt-2">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                      {Array.from({length: gridSize * gridSize}).map((_, i) => {
                          const row = Math.floor(i / gridSize);
                          const col = i % gridSize;
                          const cellKey = `${row},${col}`;
                          const zoneType = startZoneConfig[cellKey] ?? 'Both';
                          return (
                              <button
                                  type="button"
                                  key={cellKey}
                                  onClick={() => handleZoneChange(row, col)}
                                  className={clsx(
                                      "aspect-square rounded text-xs transition-colors text-white font-bold flex items-center justify-center",
                                      {
                                          "bg-gray-400 hover:bg-gray-500": zoneType === 'None',
                                          "bg-blue-500 hover:bg-blue-600": zoneType === 'A',
                                          "bg-red-500 hover:bg-red-600": zoneType === 'B',
                                          "bg-green-500 hover:bg-green-600": zoneType === 'Both',
                                      }
                                  )}
                                  title={`Set start zone for (${row},${col}) to: ${zoneType}`}
                              >
                                {zoneType === 'A' || zoneType === 'B' ? zoneType : ''}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>

           {/* Step B: Marble Placement */}
           <div className="border-t pt-4">
              <h3 className="font-medium">Step 2: Place Marbles</h3>
              <p className="text-sm text-gray-500 mb-2">Select a team below, then click on a configured start square to place or remove one of their marbles.</p>
              
              <div className="flex items-center space-x-4 my-3 justify-center">
                  <span className="text-sm font-medium">Placing for:</span>
                  <button 
                      type="button" 
                      onClick={() => setPlacingTeam('A')} 
                      className={clsx(
                          'px-4 py-1 rounded text-white font-semibold transition-all',
                          placingTeam === 'A' ? 'bg-blue-600 ring-2 ring-offset-2 ring-blue-500' : 'bg-blue-400 hover:bg-blue-500'
                      )}
                  >
                      Team A
                  </button>
                  <button 
                      type="button" 
                      onClick={() => setPlacingTeam('B')} 
                      className={clsx(
                          'px-4 py-1 rounded text-white font-semibold transition-all',
                          placingTeam === 'B' ? 'bg-red-600 ring-2 ring-offset-2 ring-red-500' : 'bg-red-400 hover:bg-red-500'
                      )}
                  >
                      Team B
                  </button>
              </div>

              <p className="text-sm font-bold text-blue-600">Team A Placed: {teamAPositions.length} / {numMarbles}</p>
              <p className="text-sm font-bold text-red-600">Team B Placed: {teamBPositions.length} / {numMarbles}</p>
              <div className="bg-gray-100 p-2 rounded mt-2">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                      {Array.from({length: gridSize * gridSize}).map((_, i) => {
                          const row = Math.floor(i / gridSize);
                          const col = i % gridSize;
                          const cellKey = `${row},${col}`;
                          const zoneType = startZoneConfig[cellKey] ?? 'Both';
                          const isAPlaced = teamAPositions.some(p => p.row === row && p.col === col);
                          const isBPlaced = teamBPositions.some(p => p.row === row && p.col === col);
                          
                          let title = '';
                          let isClickable = false;

                          if (placingTeam === 'A') {
                            isClickable = (zoneType === 'A' || zoneType === 'Both') && !isBPlaced;
                          } else { // placingTeam === 'B'
                            isClickable = (zoneType === 'B' || zoneType === 'Both') && !isAPlaced;
                          }
                          const isDisabled = !isClickable;

                          if (isAPlaced) {
                              const placedIndex = teamAPositions.findIndex(p => p.row === row && p.col === col);
                              const marble = teamAMarbleSettings[placedIndex];
                              title = `Team A Marble #${placedIndex + 1} (Value: ${marble.initialValue}, Gender: ${marble.gender === 'M' ? 'Male' : 'Female'}). Click to remove.`;
                          } else if (isBPlaced) {
                              const placedIndex = teamBPositions.findIndex(p => p.row === row && p.col === col);
                              const marble = teamBMarbleSettings[placedIndex];
                              title = `Team B Marble #${placedIndex + 1} (Value: ${marble.initialValue}, Gender: ${marble.gender === 'M' ? 'Male' : 'Female'}). Click to remove.`;
                          } else {
                              if (!isClickable) {
                                  if (zoneType === 'None') title = "Cannot place in a 'None' zone.";
                                  else if (placingTeam === 'A' && zoneType === 'B') title = "Team A cannot place in a 'Team B' zone.";
                                  else if (placingTeam === 'B' && zoneType === 'A') title = "Team B cannot place in a 'Team A' zone.";
                                  else title = "Cell is blocked or invalid for placement.";
                              } else {
                                  if (placingTeam === 'A') {
                                      if (teamAPositions.length < numMarbles) {
                                          const nextMarble = teamAMarbleSettings[teamAPositions.length];
                                          title = `Click to place Team A Marble #${teamAPositions.length + 1} (Value: ${nextMarble.initialValue}, Gender: ${nextMarble.gender === 'M' ? 'Male' : 'Female'})`;
                                      } else {
                                          title = "Team A has placed all marbles.";
                                      }
                                  } else {
                                      if (teamBPositions.length < numMarbles) {
                                          const nextMarble = teamBMarbleSettings[teamBPositions.length];
                                          title = `Click to place Team B Marble #${teamBPositions.length + 1} (Value: ${nextMarble.initialValue}, Gender: ${nextMarble.gender === 'M' ? 'Male' : 'Female'})`;
                                      } else {
                                          title = "Team B has placed all marbles.";
                                      }
                                  }
                              }
                          }

                          return (
                              <button
                                  type="button"
                                  key={cellKey}
                                  onClick={() => handlePlacement(row, col)}
                                  disabled={isDisabled}
                                  title={title}
                                  className={clsx(
                                      "aspect-square rounded text-xs transition-colors flex items-center justify-center font-bold text-white",
                                      {
                                          "bg-blue-500": isAPlaced,
                                          "bg-red-500": isBPlaced,
                                          "bg-gray-300 cursor-not-allowed": !isAPlaced && !isBPlaced && !isClickable,
                                          "bg-blue-200 hover:bg-blue-300": !isAPlaced && !isBPlaced && (zoneType === 'A' || (zoneType === 'Both' && placingTeam === 'A')),
                                          "bg-red-200 hover:bg-red-300": !isAPlaced && !isBPlaced && (zoneType === 'B' || (zoneType === 'Both' && placingTeam === 'B')),
                                          "bg-green-200 hover:bg-green-300": !isAPlaced && !isBPlaced && zoneType === 'Both',
                                          "cursor-not-allowed opacity-50": isDisabled,
                                      }
                                  )}
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
