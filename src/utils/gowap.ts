import { GameState, Marble, Cell, TeamID } from '../types';

/**
 * PHASE 1: Calculates the movement part of the turn.
 * It moves marbles, identifies battles and reproduction events for visualization,
 * but does NOT resolve them yet.
 */
export function runMovementPhase(prevState: GameState): GameState {
  const state: GameState = JSON.parse(JSON.stringify(prevState));
  
  // Reset events from the previous turn
  state.grid.flat().forEach(cell => cell.event = null);

  // Set the inputValue for this turn based on the last turn's outputValue
  for (const teamId in state.teams) {
    for (const marble of state.teams[teamId as TeamID].marbles) {
      if (marble.isAlive) {
        marble.inputValue = marble.outputValue;
      }
    }
  }

  // Move all living marbles to their new positions
  moveMarbles(state);
  
  // Identify and flag cells with events (battles or reproduction)
  state.grid.flat().forEach(cell => {
    if (cell.marbles.length > 1) {
      const teamsOnCell = new Set(cell.marbles.map(m => m.team));
      if (teamsOnCell.size > 1) {
        cell.event = 'battle';
      } else {
        const males = cell.marbles.filter(m => m.gender === 'M').length;
        const females = cell.marbles.filter(m => m.gender === 'F').length;
        if (males > 0 && females > 0) {
            cell.event = 'reproduction';
        }
      }
    }
  });

  return state;
}

/**
 * PHASE 2: Resolves all interactions, applies functions, and checks for game over.
 * This function should be called after the movement phase.
 */
export function runResolutionPhase(prevState: GameState): GameState {
    const state: GameState = JSON.parse(JSON.stringify(prevState));

    // Resolve interactions (battles and reproduction) on each cell
    resolveCellInteractions(state);
    
    // Increment turn counter
    state.turn += 1;

    // Check for win conditions
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
            if (newRow < 0) newRow = gridSize - 1;
            if (newRow >= gridSize) newRow = 0;
            if (newCol < 0) newCol = gridSize - 1;
            if (newCol >= gridSize) newCol = 0;
        } else {
            if (newRow < 0 || newRow >= gridSize) newRow = marble.position.row;
            if (newCol < 0 || newCol >= gridSize) newCol = marble.position.col;
        }
        marble.position = { row: newRow, col: newCol };
      }
    }
  }
  updateGridMarbles(state);
}

function resolveCellInteractions(state: GameState) {
    state.grid.flat().forEach(cell => {
        // Set preFuncValue for all marbles before any interactions
        cell.marbles.forEach(marbleOnCell => {
            const globalMarble = findGlobalMarble(marbleOnCell.id, state);
            if (globalMarble && globalMarble.isAlive) {
                globalMarble.preFuncValue = globalMarble.inputValue;
            }
        });

        if (cell.event === 'battle') {
            handleTeamBattle(cell, state);
        } else if (cell.event === 'reproduction') {
            handleTeamReproduction(cell.marbles, cell, state);
        }
        
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

  if (teamA_sum === teamB_sum) {
    [...teamA_marbles, ...teamB_marbles].forEach(marble => {
        const globalMarble = findGlobalMarble(marble.id, state);
        if (globalMarble) {
            globalMarble.preFuncValue = 0;
        }
    });
    return;
  }

  const winningTeam = teamA_sum > teamB_sum ? 'A' : 'B';
  const losingMarbles = winningTeam === 'A' ? teamB_marbles : teamA_marbles;
  const winningMarbles = winningTeam === 'A' ? teamA_marbles : teamB_marbles;

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
      globalMarble.preFuncValue = difference * proportion;
    }
  });
  
  handleTeamReproduction(winningMarbles, cell, state);
}


function handleTeamReproduction(marblesToCheck: Marble[], cell: Cell, state: GameState) {
    const aliveMarbles = marblesToCheck.filter(m => m.isAlive);
    if (aliveMarbles.length < 2) return;
  
    const teamId = aliveMarbles[0].team;
    const males = aliveMarbles.filter(m => m.gender === 'M').sort((a, b) => b.preFuncValue - a.preFuncValue);
    const females = aliveMarbles.filter(m => m.gender === 'F').sort((a, b) => b.preFuncValue - a.preFuncValue);
  
    const pairs = Math.min(males.length, females.length);
  
    for (let i = 0; i < pairs; i++) {
        const parent1 = males[i];
        const parent2 = females[i];
        const parent1Value = parent1.preFuncValue;
        const parent2Value = parent2.preFuncValue;
        const offspringValue = (parent1Value + parent2Value) / 2;

        const newMarble: Marble = {
            id: `marble-${teamId}-${Date.now()}-${i}`,
            team: teamId,
            gender: Math.random() < 0.5 ? 'M' : 'F',
            inputValue: offspringValue,
            preFuncValue: offspringValue,
            outputValue: offspringValue,
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
                    const output = func(globalMarble.preFuncValue);

                    if (output < 0) {
                        globalMarble.isAlive = false;
                    } else {
                        globalMarble.outputValue = output;
                    }
                } catch (e) {
                    console.error(`Error executing function at ${cell.position.row},${cell.position.col}:`, e);
                    globalMarble.outputValue = globalMarble.preFuncValue;
                }
            }
        }
    });
}

function updateGridMarbles(state: GameState) {
  state.grid.forEach(row => row.forEach(cell => cell.marbles = []));

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
      state.winner = teamA_alive ? 'A' : (teamB_alive ? 'B' : null);
    }
  } else if (state.gameMode === 'Rounds') {
    if (state.turn >= state.maxRounds) {
      state.isGameOver = true;
      const teamA_score = state.teams.A.marbles.reduce((sum, m) => sum + (m.isAlive ? m.outputValue : 0), 0);
      const teamB_score = state.teams.B.marbles.reduce((sum, m) => sum + (m.isAlive ? m.outputValue : 0), 0);
      state.winner = teamA_score > teamB_score ? 'A' : (teamB_score > teamA_score ? 'B' : null);
    }
  }
}

function findGlobalMarble(id: string, state: GameState): Marble | undefined {
    return state.teams.A.marbles.find(m => m.id === id) || state.teams.B.marbles.find(m => m.id === id);
}