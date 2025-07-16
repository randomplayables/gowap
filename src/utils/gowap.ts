import { GameState, Marble, Cell, TeamID } from '../types';

/**
 * Orchestrates the game turn, switching between movement and resolution phases.
 */
export function runGameTurn(prevState: GameState): GameState {
  if (prevState.battlePending) {
    return calculateResolutionPhase(prevState);
  } else {
    return calculateMovementPhase(prevState);
  }
}

/**
 * PHASE 1: Move marbles and identify upcoming battles.
 */
function calculateMovementPhase(prevState: GameState): GameState {
  const state: GameState = JSON.parse(JSON.stringify(prevState));
  
  // 1. Move all living marbles to their new positions
  moveMarbles(state);
  
  // 2. Identify and flag cells with battles
  let battleDetected = false;
  state.grid.flat().forEach(cell => {
    if (cell.marbles.length > 1) {
      const teamsOnCell = new Set(cell.marbles.map(m => m.team));
      if (teamsOnCell.size > 1) {
        cell.hasBattle = true;
        battleDetected = true;
      }
    }
  });

  // 3. Set the battlePending flag if any battles were found
  state.battlePending = battleDetected;

  // If no battles, immediately resolve the turn
  if (!battleDetected) {
    return calculateResolutionPhase(state);
  }

  return state;
}

/**
 * PHASE 2: Resolve interactions, apply functions, and check for game over.
 */
function calculateResolutionPhase(prevState: GameState): GameState {
    const state: GameState = JSON.parse(JSON.stringify(prevState));

    // 1. Resolve interactions (battles and reproduction) on each cell
    resolveCellInteractions(state);
    
    // 2. Reset battle flags
    state.grid.flat().forEach(cell => cell.hasBattle = false);
    state.battlePending = false;

    // 3. Increment turn counter
    state.turn += 1;

    // 4. Check for win conditions
    checkWinConditions(state);
  
    return state;
}


function moveMarbles(state: GameState) {
  const gridSize = state.grid.length;
  for (const teamId in state.teams) {
    for (const marble of state.teams[teamId as TeamID].marbles) {
      if (marble.isAlive) {
        // First flip: forward or backward
        const rowChange = Math.random() < 0.5 ? 1 : -1;
        // Second flip: left or right
        const colChange = Math.random() < 0.5 ? 1 : -1;

        let newRow = marble.position.row + rowChange;
        let newCol = marble.position.col + colChange;

        if (state.wrap) {
            // Boundary checks (simple wrap-around)
            if (newRow < 0) newRow = gridSize - 1;
            if (newRow >= gridSize) newRow = 0;
            if (newCol < 0) newCol = gridSize - 1;
            if (newCol >= gridSize) newCol = 0;
        } else {
            // Boundary checks (clamp to edge)
            if (newRow < 0 || newRow >= gridSize) {
                newRow = marble.position.row;
            }
            if (newCol < 0 || newCol >= gridSize) {
                newCol = marble.position.col;
            }
        }

        marble.position = { row: newRow, col: newCol };
      }
    }
  }
  updateGridMarbles(state);
}

function resolveCellInteractions(state: GameState) {
    state.grid.flat().forEach(cell => {
        if (cell.marbles.length > 1) {
            const teamsOnCell = new Set(cell.marbles.map(m => m.team));
            if (teamsOnCell.size > 1) {
                // Battle between teams
                handleTeamBattle(cell, state);
            } else {
                // Interaction within the same team (reproduction)
                handleTeamReproduction(cell.marbles, cell, state);
            }
        }
        // Apply cell function to any marbles on the cell, using the main state
        applyCellFunctionToSurvivors(cell, state);
    });
    updateGridMarbles(state);
}


function handleTeamBattle(cell: Cell, state: GameState) {
  const teamA_marbles = cell.marbles.filter(m => m.team === 'A' && m.isAlive);
  const teamB_marbles = cell.marbles.filter(m => m.team === 'B' && m.isAlive);

  if (teamA_marbles.length === 0 || teamB_marbles.length === 0) return;

  const teamA_sum = teamA_marbles.reduce((sum, m) => sum + m.inputValue, 0);
  const teamB_sum = teamB_marbles.reduce((sum, m) => sum + m.inputValue, 0);

  // New logic for handling ties
  if (teamA_sum === teamB_sum) {
    // It's a tie. Both sides are depleted.
    // Set the inputValue of all involved marbles to 0.
    teamA_marbles.forEach(marble => {
      const globalMarble = findGlobalMarble(marble.id, state);
      if (globalMarble) {
        globalMarble.inputValue = 0;
      }
    });
    teamB_marbles.forEach(marble => {
      const globalMarble = findGlobalMarble(marble.id, state);
      if (globalMarble) {
        globalMarble.inputValue = 0;
      }
    });
    return; // Exit after handling the tie.
  }

  const winningTeam = teamA_sum > teamB_sum ? 'A' : 'B';
  const losingTeam = winningTeam === 'A' ? 'B' : 'A';
  
  const winningMarbles = winningTeam === 'A' ? teamA_marbles : teamB_marbles;
  const losingMarbles = losingTeam === 'A' ? teamA_marbles : teamB_marbles;

  losingMarbles.forEach(marble => {
    const globalMarble = findGlobalMarble(marble.id, state);
    if (globalMarble) globalMarble.isAlive = false;
  });

  const difference = Math.abs(teamA_sum - teamB_sum);
  const totalWinnerContribution = winningTeam === 'A' ? teamA_sum : teamB_sum;

  winningMarbles.forEach(marble => {
    const proportion = totalWinnerContribution > 0 ? (marble.inputValue / totalWinnerContribution) : (1 / winningMarbles.length);
    const globalMarble = findGlobalMarble(marble.id, state);
    if (globalMarble) {
      globalMarble.inputValue = difference * proportion;
    }
  });
  
  // After battle, check for reproduction ONLY among the explicit winners.
  handleTeamReproduction(winningMarbles, cell, state);
}


function handleTeamReproduction(marblesToCheck: Marble[], cell: Cell, state: GameState) {
    const aliveMarbles = marblesToCheck.filter(m => m.isAlive);
    if (aliveMarbles.length < 2) return;
  
    const teamId = aliveMarbles[0].team;
    const males = aliveMarbles.filter(m => m.gender === 'M').sort((a, b) => b.inputValue - a.inputValue);
    const females = aliveMarbles.filter(m => m.gender === 'F').sort((a, b) => b.inputValue - a.inputValue);
  
    const pairs = Math.min(males.length, females.length);
  
    for (let i = 0; i < pairs; i++) {
        const parent1 = males[i];
        const parent2 = females[i];
        const offspringValue = (parent1.inputValue + parent2.inputValue) / 2;

        const newMarble: Marble = {
            id: `marble-${teamId}-${Date.now()}-${i}`,
            team: teamId,
            gender: Math.random() < 0.5 ? 'M' : 'F',
            inputValue: offspringValue,
            outputValue: offspringValue, // Start with same output
            position: { ...cell.position },
            isAlive: true,
        };
        state.teams[teamId].marbles.push(newMarble);
    }
}


function applyCellFunctionToSurvivors(cell: Cell, state: GameState) {
    cell.marbles.forEach(marbleOnCell => {
        if (marbleOnCell.isAlive) {
            const globalMarble = findGlobalMarble(marbleOnCell.id, state);
            if (globalMarble) {
                try {
                    const func = new Function('x', cell.func);
                    const output = func(globalMarble.inputValue);

                    if (output < 0) {
                        globalMarble.isAlive = false;
                    } else {
                        globalMarble.outputValue = output;
                        globalMarble.inputValue = output;
                    }
                } catch (e) {
                    console.error(`Error executing function at ${cell.position.row},${cell.position.col}:`, e);
                    globalMarble.outputValue = globalMarble.inputValue;
                }
            }
        }
    });
}

function updateGridMarbles(state: GameState) {
  // Clear marbles from all cells
  state.grid.forEach(row => row.forEach(cell => cell.marbles = []));

  // Re-populate the grid with current marble positions
  for (const teamId in state.teams) {
    for (const marble of state.teams[teamId as TeamID].marbles) {
      if (marble.isAlive) {
        state.grid[marble.position.row][marble.position.col].marbles.push(marble);
      }
    }
  }
}

function checkWinConditions(state: GameState) {
  const teamA_alive = state.teams.A.marbles.some(m => m.isAlive);
  const teamB_alive = state.teams.B.marbles.some(m => m.isAlive);

  if (state.gameMode === 'Last Standing') {
    if (!teamA_alive || !teamB_alive) {
      state.isGameOver = true;
      state.winner = teamA_alive ? 'A' : 'B';
    }
  } else if (state.gameMode === 'Rounds') {
    if (state.turn >= state.maxRounds) {
      state.isGameOver = true;
      const teamA_score = state.teams.A.marbles.reduce((sum, m) => sum + (m.isAlive ? m.outputValue : 0), 0);
      const teamB_score = state.teams.B.marbles.reduce((sum, m) => sum + (m.isAlive ? m.outputValue : 0), 0);
      state.winner = teamA_score > teamB_score ? 'A' : 'B';
    }
  }
}

function findGlobalMarble(id: string, state: GameState): Marble | undefined {
    return state.teams.A.marbles.find(m => m.id === id) || state.teams.B.marbles.find(m => m.id === id);
}