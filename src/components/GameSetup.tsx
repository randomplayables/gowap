import { useState } from 'react';
import { GameConfig, Gender } from '../types';

interface GameSetupProps {
  onSetupComplete: (config: GameConfig) => void;
}

export default function GameSetup({ onSetupComplete }: GameSetupProps) {
  const [gridSize, setGridSize] = useState(5);
  const [numMarbles, setNumMarbles] = useState(3);
  const [totalInitialValue] = useState(100);
  const [gameMode, setGameMode] = useState<'Last Standing' | 'Rounds'>('Last Standing');
  const [maxRounds, setMaxRounds] = useState(50);
  const [marbleSettings, setMarbleSettings] = useState<{ initialValue: number; gender: Gender }[]>(
    Array.from({ length: 3 }, () => ({ initialValue: Math.floor(100 / 3), gender: 'M' }))
  );

  const handleNumMarblesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setNumMarbles(count);
    const initialValue = Math.floor(totalInitialValue / count);
    setMarbleSettings(Array.from({ length: count }, () => ({ initialValue, gender: 'M' })));
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
  
  const currentTotal = marbleSettings.reduce((sum, s) => sum + s.initialValue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTotal !== totalInitialValue) {
        alert(`The sum of marble values must be exactly ${totalInitialValue}.`);
        return;
    }
    onSetupComplete({
      gridSize, numMarbles, totalInitialValue, gameMode, maxRounds, marbleSettings
    });
  };

  return (
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

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Start Game</button>
      </form>
    </div>
  );
}