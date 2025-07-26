import { useState, useCallback } from 'react';
import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
import { runMovementPhase, runResolutionPhase } from '../utils/gowap';
import { initGameSession, saveGameData, getGauntletChallenge, resolveGauntletChallenge } from '../services/apiService';

const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%
const VISUALIZATION_DELAY = 500; // ms for the flash effect

export const useGowapGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);

    const initializeGame = useCallback(async (config: GameConfig) => {
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
            saveGameData(0, { event: 'game_initialized', config });
        }
    }, []);
    
    const initializeGauntletGame = useCallback(async (gauntletId: string) => {
        try {
            const challenge = await getGauntletChallenge(gauntletId);
            const challengerConfig = challenge.challenger.setupConfig;
            
            // This now correctly merges the challenger's and opponent's configs
            const opponentConfig = challenge.opponent.setupConfig;

            const fullGameConfig: GameConfig = {
                ...challengerConfig,
                teamBMarbleSettings: opponentConfig.teamBMarbleSettings,
                teamBPositions: opponentConfig.teamBPositions,
            };

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

            const urlParams = new URLSearchParams(window.location.search);
            const gauntletId = urlParams.get('gauntletId');
            if (gauntletId && resolvedState.winner) {
                try {
                    await resolveGauntletChallenge(gauntletId, resolvedState.winner);
                } catch (error) {
                    console.error("Failed to resolve gauntlet on platform:", error);
                    // You could show an error to the user here if desired
                }
            }
        }

        setIsProcessingTurn(false);
    }, [gameState, isProcessingTurn]);
    
    const resetGame = useCallback(() => {
        setGameState(null);
        setIsProcessingTurn(false);
    }, []);

    return { gameState, initializeGame, initializeGauntletGame, nextTurn, resetGame, isProcessingTurn };
};