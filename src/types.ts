export type Gender = 'M' | 'F';
export type TeamID = 'A' | 'B';
export type GameMode = 'Last Standing' | 'Rounds';
export type StartZoneType = 'A' | 'B' | 'Both' | 'None';
export type GameModeType = 'single-player' | 'gauntlet'; // New type for mode selection

export interface MarblePosition {
  row: number;
  col: number;
}

export interface Marble {
  id: string;
  team: TeamID;
  gender: Gender;
  inputValue: number;
  preFuncValue: number;
  outputValue: number;
  position: MarblePosition;
  isAlive: boolean;
}

export interface Cell {
  position: MarblePosition;
  marbles: Marble[];
  // The function is represented by its string definition for user customization
  func: string;
  // This tracks the type of event for visual feedback
  event: 'battle' | 'reproduction' | null;
}

export type Grid = Cell[][];

export interface Team {
  id: TeamID;
  marbles: Marble[];
}

export interface GameConfig {
  gridSize: number;
  numMarbles: number;
  totalInitialValue: number;
  gameMode: GameMode;
  maxRounds: number;
  wrap: boolean;
  teamAMarbleSettings: {
    initialValue: number;
    gender: Gender;
  }[];
  teamBMarbleSettings: {
    initialValue: number;
    gender: Gender;
  }[];
  startZoneConfig: Record<string, StartZoneType>;
  // Allows custom functions per cell
  customFunctions?: Record<string, string>; // e.g. { "0,0": "return x * 1.1;" }
  teamAPositions: MarblePosition[];
  teamBPositions: MarblePosition[];
}

export interface GameState {
  grid: Grid;
  teams: Record<TeamID, Team>;
  turn: number;
  isGameOver: boolean;
  winner: TeamID | null;
  gameMode: GameMode;
  maxRounds: number;
  wrap: boolean;
  // This flag is now used to signal that a visual event (flash) is happening
  isEventVisualizing: boolean;
}