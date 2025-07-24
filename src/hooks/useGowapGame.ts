import { useState, useCallback } from 'react';
import { GameState, Grid, TeamID, GameConfig, Team, MarblePosition } from '../types';
import { runMovementPhase, runResolutionPhase } from '../utils/gowap';
import { initGameSession, saveGameData, getGauntletChallenge } from '../services/apiService';

const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%
const VISUALIZATION_DELAY = 500; // ms for the flash effect

export const useGowapGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);

    // NOTE: The automatic session initialization on component load has been removed.
    // Session creation is now handled by the initializeGame function.

    const initializeGame = useCallback(async (config: GameConfig) => {
        // A game session is now created only when the game is explicitly started.
        const session = await initGameSession();
        
        const grid: Grid = Array.from({ length: config.gridSize }, (_, r) =>
            Array.from({ length: config.gridSize }, (_, c) => ({
                position: { row: r, col: c },
                marbles: [],
                func: config.customFunctions?.[`${r},${c}`] ?? defaultCellFunction,
                event: null,
            }))
        );

        const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
        const numMarbles = config.numMarbles || 0;
        const teamAMarbleSettings = config.teamAMarbleSettings || [];
        const teamBMarbleSettings = config.teamBMarbleSettings || [];

        for (let i = 0; i < numMarbles; i++) {
            if (teamAMarbleSettings[i] && config.teamAPositions[i]) {
                const settingA = teamAMarbleSettings[i];
                teams.A.marbles.push({
                    id: `A-${i}`, team: 'A', gender: settingA.gender,
                    inputValue: settingA.initialValue, preFuncValue: settingA.initialValue, outputValue: settingA.initialValue,
                    position: config.teamAPositions[i], isAlive: true,
                });
            }
            if (teamBMarbleSettings[i] && config.teamBPositions[i]) {
                const settingB = teamBMarbleSettings[i];
                teams.B.marbles.push({
                    id: `B-${i}`, team: 'B', gender: settingB.gender,
                    inputValue: settingB.initialValue, preFuncValue: settingB.initialValue, outputValue: settingB.initialValue,
                    position: config.teamBPositions[i], isAlive: true,
                });
            }
        }
        
        const initialState: GameState = {
            grid, teams, turn: 0, isGameOver: false, winner: null,
            gameMode: config.gameMode, maxRounds: config.maxRounds, wrap: config.wrap,
            isEventVisualizing: false,
        };

        initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
        initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

        setGameState(initialState);

        if (session) {
            // Save the initial game state using the newly created session.
            saveGameData(0, { event: 'game_initialized', config });
        }
    }, []); // Removed gameSession from dependency array
    
    const initializeGauntletGame = useCallback(async (gauntletId: string) => {
        try {
            const challenge = await getGauntletChallenge(gauntletId);
            const challengerConfig = challenge.challenger.setupConfig;
            
            const opponentConfig = {
                teamBMarbleSettings: challengerConfig.teamAMarbleSettings,
                teamBPositions: challengerConfig.teamAPositions.map((p: MarblePosition) => ({
                    row: challengerConfig.gridSize - 1 - p.row,
                    col: challengerConfig.gridSize - 1 - p.col
                })),
            };

            const fullGameConfig: GameConfig = {
                ...challengerConfig,
                teamBMarbleSettings: opponentConfig.teamBMarbleSettings,
                teamBPositions: opponentConfig.teamBPositions,
            };

            // This will now correctly await the session creation inside initializeGame.
            await initializeGame(fullGameConfig);

        } catch (error) {
            console.error("Failed to initialize Gauntlet game:", error);
        }
    }, [initializeGame]);


    const nextTurn = useCallback(async () => {
        if (!gameState || gameState.isGameOver || isProcessingTurn) return;

        setIsProcessingTurn(true);

        const movementState = runMovementPhase(gameState);
        const hasEvents = movementState.grid.flat().some(cell => cell.event !== null);
        
        if (hasEvents) {
            setGameState({ ...movementState, isEventVisualizing: true });
            await new Promise(resolve => setTimeout(resolve, VISUALIZATION_DELAY));
        }

        const resolvedState = runResolutionPhase(movementState);
        setGameState({ ...resolvedState, isEventVisualizing: false });

        // The session is now stored in localStorage by apiService, so no need to pass it.
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

        setIsProcessingTurn(false);
    }, [gameState, isProcessingTurn]);
    
    const resetGame = useCallback(() => {
        setGameState(null);
        setIsProcessingTurn(false);
        // Session will be re-initialized on the next call to initializeGame
    }, []);

    return { gameState, initializeGame, initializeGauntletGame, nextTurn, resetGame, isProcessingTurn };
};