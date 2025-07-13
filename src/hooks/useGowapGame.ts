import { useState, useCallback } from 'react';
import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
import { runGameTurn } from '../utils/gowap';

const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%

export const useGowapGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);

    const initializeGame = useCallback((config: GameConfig) => {
        const grid: Grid = Array.from({ length: config.gridSize }, (_, r) =>
            Array.from({ length: config.gridSize }, (_, c) => ({
                position: { row: r, col: c },
                marbles: [],
                func: config.customFunctions?.[`${r},${c}`] ?? defaultCellFunction,
            }))
        );

        const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
        // Team A starts at the top row, Team B at the bottom
        for (let i = 0; i < config.numMarbles; i++) {
            const setting = config.marbleSettings[i];
            const colA = Math.floor((i / config.numMarbles) * config.gridSize);
            teams.A.marbles.push({
                id: `A-${i}`, team: 'A', gender: setting.gender,
                inputValue: setting.initialValue, outputValue: setting.initialValue,
                position: { row: 0, col: colA }, isAlive: true,
            });

            const colB = Math.floor((i / config.numMarbles) * config.gridSize);
            teams.B.marbles.push({
                id: `B-${i}`, team: 'B', gender: setting.gender,
                inputValue: setting.initialValue, outputValue: setting.initialValue,
                position: { row: config.gridSize - 1, col: colB }, isAlive: true,
            });
        }
        
        const initialState: GameState = {
            grid,
            teams,
            turn: 0,
            isGameOver: false,
            winner: null,
            gameMode: config.gameMode,
            maxRounds: config.maxRounds,
            battlePending: false,
        };

        // Initial population of the grid
        initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
        initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

        setGameState(initialState);
    }, []);

    const nextTurn = useCallback(() => {
        if (gameState && !gameState.isGameOver) {
            const nextState = runGameTurn(gameState);
            setGameState(nextState);
        }
    }, [gameState]);
    
    const resetGame = useCallback(() => {
        setGameState(null);
    }, []);

    return { gameState, initializeGame, nextTurn, resetGame };
};