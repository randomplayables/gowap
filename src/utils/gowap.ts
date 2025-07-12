import { GameState, Marble, Cell, TeamID } from '../types';

/**
 * Executes one turn of the game, updating the state.
 */
export function runGameTurn(prevState: GameState): GameState {
  const state: GameState = JSON.parse(JSON.stringify(prevState));

  // 1. Move all living marbles
  moveMarbles(state);

  // 2. Resolve interactions on each cell
  resolveCellInteractions(state);

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

        // Boundary checks (simple wrap-around)
        if (newRow < 0) newRow = gridSize - 1;
        if (newRow >= gridSize) newRow = 0;
        if (newCol < 0) newCol = gridSize - 1;
        if (newCol >= gridSize) newCol = 0;

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
                handleTeamReproduction(cell, state);
            }
        }
        // Apply cell function to any single marbles
        applyCellFunctionToSurvivors(cell);
    });
    updateGridMarbles(state);
}


function handleTeamBattle(cell: Cell, state: GameState) {
  const teamA_marbles = cell.marbles.filter(m => m.team === 'A' && m.isAlive);
  const teamB_marbles = cell.marbles.filter(m => m.team === 'B' && m.isAlive);

  if (teamA_marbles.length === 0 || teamB_marbles.length === 0) return;

  const teamA_sum = teamA_marbles.reduce((sum, m) => sum + m.inputValue, 0);
  const teamB_sum = teamB_marbles.reduce((sum, m) => sum + m.inputValue, 0);

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
    const proportion = marble.inputValue / totalWinnerContribution;
    const globalMarble = findGlobalMarble(marble.id, state);
    if (globalMarble) {
      globalMarble.inputValue = difference * proportion;
    }
  });
  
  // After battle, check for reproduction among winners
  handleTeamReproduction(cell, state);
}


function handleTeamReproduction(cell: Cell, state: GameState) {
    const aliveMarbles = cell.marbles.filter(m => m.isAlive);
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


function applyCellFunctionToSurvivors(cell: Cell) {
    cell.marbles.forEach(marble => {
        if(marble.isAlive) {
            try {
                // Create a function from the string and execute it
                const func = new Function('x', cell.func);
                const output = func(marble.inputValue);
                marble.outputValue = output;
                // The output of this turn becomes the input for the next
                marble.inputValue = output;
            } catch (e) {
                console.error(`Error executing function at ${cell.position.row},${cell.position.col}:`, e);
                // If func fails, keep the value the same
                marble.outputValue = marble.inputValue;
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