export type Gender = 'M' | 'F';
export type TeamID = 'A' | 'B';
export type GameMode = 'Last Standing' | 'Rounds';

export interface Marble {
  id: string;
  team: TeamID;
  gender: Gender;
  inputValue: number;
  outputValue: number;
  position: { row: number; col: number };
  isAlive: boolean;
}

export interface Cell {
  position: { row: number; col: number };
  marbles: Marble[];
  // The function is represented by its string definition for user customization
  func: string; 
  hasBattle?: boolean;
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
  marbleSettings: {
    initialValue: number;
    gender: Gender;
  }[];
  // Allows custom functions per cell
  customFunctions?: Record<string, string>; // e.g. { "0,0": "return x * 1.1;" }
}

export interface GameState {
  grid: Grid;
  teams: Record<TeamID, Team>;
  turn: number;
  isGameOver: boolean;
  winner: TeamID | null;
  gameMode: GameMode;
  maxRounds: number;
  battlePending?: boolean;
}