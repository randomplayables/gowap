import { useState, useCallback, useEffect } from 'react';
import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
import { runMovementPhase, runResolutionPhase } from '../utils/gowap';
import { initGameSession, saveGameData } from '../services/apiService';

const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%
const VISUALIZATION_DELAY = 500; // ms for the flash effect

export const useGowapGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameSession, setGameSession] = useState<any>(null);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);

    // Effect to initialize the session when the game starts
    useEffect(() => {
        const initSession = async () => {
            const session = await initGameSession();
            setGameSession(session);
        };
        initSession();
    }, []);

    const initializeGame = useCallback((config: GameConfig) => {
        const grid: Grid = Array.from({ length: config.gridSize }, (_, r) =>
            Array.from({ length: config.gridSize }, (_, c) => ({
                position: { row: r, col: c },
                marbles: [],
                func: config.customFunctions?.[`${r},${c}`] ?? defaultCellFunction,
                event: null,
            }))
        );

        const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
        for (let i = 0; i < config.numMarbles; i++) {
            const settingA = config.teamAMarbleSettings[i];
            teams.A.marbles.push({
                id: `A-${i}`, team: 'A', gender: settingA.gender,
                inputValue: settingA.initialValue, preFuncValue: settingA.initialValue, outputValue: settingA.initialValue,
                position: config.teamAPositions[i], isAlive: true,
            });

            const settingB = config.teamBMarbleSettings[i];
            teams.B.marbles.push({
                id: `B-${i}`, team: 'B', gender: settingB.gender,
                inputValue: settingB.initialValue, preFuncValue: settingB.initialValue, outputValue: settingB.initialValue,
                position: config.teamBPositions[i], isAlive: true,
            });
        }
        
        const initialState: GameState = {
            grid, teams, turn: 0, isGameOver: false, winner: null,
            gameMode: config.gameMode, maxRounds: config.maxRounds, wrap: config.wrap,
            isEventVisualizing: false,
        };

        initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
        initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

        setGameState(initialState);

        if (gameSession) {
            saveGameData(0, { event: 'game_initialized', config });
        }
    }, [gameSession]);

    const nextTurn = useCallback(async () => {
        if (!gameState || gameState.isGameOver || isProcessingTurn) return;

        setIsProcessingTurn(true);

        // PHASE 1: Run movement and identify events
        const movementState = runMovementPhase(gameState);
        const hasEvents = movementState.grid.flat().some(cell => cell.event !== null);
        
        if (hasEvents) {
            // Show the visual flashes
            setGameState({ ...movementState, isEventVisualizing: true });

            // Wait for the flash animation duration
            await new Promise(resolve => setTimeout(resolve, VISUALIZATION_DELAY));
        }

        // PHASE 2: Resolve the turn and get the final state
        const resolvedState = runResolutionPhase(movementState);
        setGameState({ ...resolvedState, isEventVisualizing: false });

        // Save the final, resolved state to the database
        if (gameSession) {
            const turnData = {
                event: 'turn_end',
                turn: resolvedState.turn,
                teams: resolvedState.teams,
                grid: resolvedState.grid,
                isGameOver: resolvedState.isGameOver,
                winner: resolvedState.winner,
            };
            saveGameData(resolvedState.turn, turnData);

            if (resolvedState.isGameOver) {
                const finalGameData = {
                    event: 'game_over',
                    totalTurns: resolvedState.turn,
                    winner: resolvedState.winner,
                    finalTeamAState: resolvedState.teams.A,
                    finalTeamBState: resolvedState.teams.B,
                };
                saveGameData(resolvedState.turn + 1, finalGameData);
            }
        }

        setIsProcessingTurn(false);
    }, [gameState, gameSession, isProcessingTurn]);
    
    const resetGame = useCallback(() => {
        setGameState(null);
        setIsProcessingTurn(false);
        const initSession = async () => {
            const session = await initGameSession();
            setGameSession(session);
        };
        initSession();
    }, []);

    return { gameState, initializeGame, nextTurn, resetGame, isProcessingTurn };
};