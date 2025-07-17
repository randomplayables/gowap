// // import { useState, useCallback } from 'react';
// // import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
// // import { runGameTurn } from '../utils/gowap';

// // const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%

// // export const useGowapGame = () => {
// //     const [gameState, setGameState] = useState<GameState | null>(null);

// //     const initializeGame = useCallback((config: GameConfig) => {
// //         const grid: Grid = Array.from({ length: config.gridSize }, (_, r) =>
// //             Array.from({ length: config.gridSize }, (_, c) => ({
// //                 position: { row: r, col: c },
// //                 marbles: [],
// //                 func: config.customFunctions?.[`${r},${c}`] ?? defaultCellFunction,
// //             }))
// //         );

// //         const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
// //         // Use user-defined settings and positions for marbles for Team A
// //         for (let i = 0; i < config.numMarbles; i++) {
// //             const setting = config.teamAMarbleSettings[i];
// //             teams.A.marbles.push({
// //                 id: `A-${i}`, team: 'A', gender: setting.gender,
// //                 inputValue: setting.initialValue, outputValue: setting.initialValue,
// //                 position: config.teamAPositions[i],
// //                 isAlive: true,
// //             });
// //         }
        
// //         // Use user-defined settings and positions for marbles for Team B
// //         for (let i = 0; i < config.numMarbles; i++) {
// //             const setting = config.teamBMarbleSettings[i];
// //             teams.B.marbles.push({
// //                 id: `B-${i}`, team: 'B', gender: setting.gender,
// //                 inputValue: setting.initialValue, outputValue: setting.initialValue,
// //                 position: config.teamBPositions[i],
// //                 isAlive: true,
// //             });
// //         }
        
// //         const initialState: GameState = {
// //             grid,
// //             teams,
// //             turn: 0,
// //             isGameOver: false,
// //             winner: null,
// //             gameMode: config.gameMode,
// //             maxRounds: config.maxRounds,
// //             wrap: config.wrap,
// //             battlePending: false,
// //         };

// //         // Initial population of the grid
// //         initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
// //         initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

// //         setGameState(initialState);
// //     }, []);

// //     const nextTurn = useCallback(() => {
// //         if (gameState && !gameState.isGameOver) {
// //             const nextState = runGameTurn(gameState);
// //             setGameState(nextState);
// //         }
// //     }, [gameState]);
    
// //     const resetGame = useCallback(() => {
// //         setGameState(null);
// //     }, []);

// //     return { gameState, initializeGame, nextTurn, resetGame };
// // };





// import { useState, useCallback, useEffect } from 'react';
// import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
// import { runGameTurn } from '../utils/gowap';
// import { initGameSession, saveGameData } from '../services/apiService';

// const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%

// export const useGowapGame = () => {
//     const [gameState, setGameState] = useState<GameState | null>(null);
//     const [gameSession, setGameSession] = useState<any>(null);

//     // Effect to initialize the session when the game starts
//     useEffect(() => {
//         const initSession = async () => {
//             const session = await initGameSession();
//             setGameSession(session);
//         };
//         initSession();
//     }, []);

//     const initializeGame = useCallback((config: GameConfig) => {
//         const grid: Grid = Array.from({ length: config.gridSize }, (_, r) =>
//             Array.from({ length: config.gridSize }, (_, c) => ({
//                 position: { row: r, col: c },
//                 marbles: [],
//                 func: config.customFunctions?.[`${r},${c}`] ?? defaultCellFunction,
//             }))
//         );

//         const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
//         // Use user-defined settings and positions for marbles for Team A
//         for (let i = 0; i < config.numMarbles; i++) {
//             const setting = config.teamAMarbleSettings[i];
//             teams.A.marbles.push({
//                 id: `A-${i}`, team: 'A', gender: setting.gender,
//                 inputValue: setting.initialValue, outputValue: setting.initialValue,
//                 position: config.teamAPositions[i],
//                 isAlive: true,
//             });
//         }
        
//         // Use user-defined settings and positions for marbles for Team B
//         for (let i = 0; i < config.numMarbles; i++) {
//             const setting = config.teamBMarbleSettings[i];
//             teams.B.marbles.push({
//                 id: `B-${i}`, team: 'B', gender: setting.gender,
//                 inputValue: setting.initialValue, outputValue: setting.initialValue,
//                 position: config.teamBPositions[i],
//                 isAlive: true,
//             });
//         }
        
//         const initialState: GameState = {
//             grid,
//             teams,
//             turn: 0,
//             isGameOver: false,
//             winner: null,
//             gameMode: config.gameMode,
//             maxRounds: config.maxRounds,
//             wrap: config.wrap,
//             battlePending: false,
//         };

//         // Initial population of the grid
//         initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
//         initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

//         setGameState(initialState);

//         // Save the initial setup as "turn 0" for research purposes
//         if (gameSession) {
//             saveGameData(0, { event: 'game_initialized', config });
//         }
//     }, [gameSession]); // Depend on gameSession to ensure it's available

//     const nextTurn = useCallback(() => {
//         if (gameState && !gameState.isGameOver) {
//             const nextState = runGameTurn(gameState);
//             setGameState(nextState);

//             // Save the complete state of the game after each turn for research
//             if (gameSession) {
//                 const turnData = {
//                     event: 'turn_end',
//                     turn: nextState.turn,
//                     teams: nextState.teams,
//                     grid: nextState.grid, // Note: This can be large but is valuable data
//                     isGameOver: nextState.isGameOver,
//                     winner: nextState.winner,
//                     battlePending: nextState.battlePending,
//                 };
//                 saveGameData(nextState.turn, turnData);

//                 // If the game just ended, save a final summary event
//                 if (nextState.isGameOver) {
//                     const finalGameData = {
//                         event: 'game_over',
//                         totalTurns: nextState.turn,
//                         winner: nextState.winner,
//                         finalTeamAState: nextState.teams.A,
//                         finalTeamBState: nextState.teams.B,
//                     };
//                     // Use turn + 1 as the "round number" for the final event to avoid conflicts
//                     saveGameData(nextState.turn + 1, finalGameData);
//                 }
//             }
//         }
//     }, [gameState, gameSession]);
    
//     const resetGame = useCallback(() => {
//         setGameState(null);
//         // Re-initialize session for the new game
//         const initSession = async () => {
//             const session = await initGameSession();
//             setGameSession(session);
//         };
//         initSession();
//     }, []);

//     return { gameState, initializeGame, nextTurn, resetGame };
// };







import { useState, useCallback, useEffect } from 'react';
import { GameState, Grid, TeamID, GameConfig, Team } from '../types';
import { runGameTurn } from '../utils/gowap';
import { initGameSession, saveGameData } from '../services/apiService';

const defaultCellFunction = "return x * 1.05;"; // Default function increases value by 5%

export const useGowapGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameSession, setGameSession] = useState<any>(null);

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
            }))
        );

        const teams: Record<TeamID, Team> = { A: { id: 'A', marbles: [] }, B: { id: 'B', marbles: [] } };
        
        // Use user-defined settings and positions for marbles for Team A
        for (let i = 0; i < config.numMarbles; i++) {
            const setting = config.teamAMarbleSettings[i];
            teams.A.marbles.push({
                id: `A-${i}`, team: 'A', gender: setting.gender,
                inputValue: setting.initialValue,
                preFuncValue: setting.initialValue,
                outputValue: setting.initialValue,
                position: config.teamAPositions[i],
                isAlive: true,
            });
        }
        
        // Use user-defined settings and positions for marbles for Team B
        for (let i = 0; i < config.numMarbles; i++) {
            const setting = config.teamBMarbleSettings[i];
            teams.B.marbles.push({
                id: `B-${i}`, team: 'B', gender: setting.gender,
                inputValue: setting.initialValue,
                preFuncValue: setting.initialValue,
                outputValue: setting.initialValue,
                position: config.teamBPositions[i],
                isAlive: true,
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
            wrap: config.wrap,
            battlePending: false,
        };

        // Initial population of the grid
        initialState.teams.A.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));
        initialState.teams.B.marbles.forEach(m => initialState.grid[m.position.row][m.position.col].marbles.push(m));

        setGameState(initialState);

        // Save the initial setup as "turn 0" for research purposes
        if (gameSession) {
            saveGameData(0, { event: 'game_initialized', config });
        }
    }, [gameSession]); // Depend on gameSession to ensure it's available

    const nextTurn = useCallback(() => {
        if (gameState && !gameState.isGameOver) {
            const nextState = runGameTurn(gameState);
            setGameState(nextState);

            // Save the complete state of the game after each turn for research
            if (gameSession) {
                const turnData = {
                    event: 'turn_end',
                    turn: nextState.turn,
                    teams: nextState.teams,
                    grid: nextState.grid, // Note: This can be large but is valuable data
                    isGameOver: nextState.isGameOver,
                    winner: nextState.winner,
                    battlePending: nextState.battlePending,
                };
                saveGameData(nextState.turn, turnData);

                // If the game just ended, save a final summary event
                if (nextState.isGameOver) {
                    const finalGameData = {
                        event: 'game_over',
                        totalTurns: nextState.turn,
                        winner: nextState.winner,
                        finalTeamAState: nextState.teams.A,
                        finalTeamBState: nextState.teams.B,
                    };
                    // Use turn + 1 as the "round number" for the final event to avoid conflicts
                    saveGameData(nextState.turn + 1, finalGameData);
                }
            }
        }
    }, [gameState, gameSession]);
    
    const resetGame = useCallback(() => {
        setGameState(null);
        // Re-initialize session for the new game
        const initSession = async () => {
            const session = await initGameSession();
            setGameSession(session);
        };
        initSession();
    }, []);

    return { gameState, initializeGame, nextTurn, resetGame };
};
