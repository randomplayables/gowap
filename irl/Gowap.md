# Gowap: The Game of War and Peace
An In-Real-Life Adaptation

## Overview

Gowap is a strategic board game where two players control teams of tokens on a grid. Each token has a value and a gender, which influences its ability to fight and create new tokens. The goal is to either be the last team standing or to have the highest total value after a set number of rounds. A key element of strategy involves defining a mathematical function for each cell of the board, which will alter the value of any token that lands on it.

## Materials Needed

-   A grid board (e.g., a chessboard or paper with a 5x5 or 9x9 grid).
-   Tokens for two teams (e.g., 4 blue poker chips and 4 red poker chips).
-   A wet-erase marker or small stickers to write values and genders (M/F) on the tokens.
-   Three coins (quarters work well).
-   Paper and pen for tracking turns and calculations.
-   A transparent sheet to overlay on the grid or a separate sheet of paper to map cell functions.

## Setup

1.  **Agree on Settings**: Players decide on the game settings before starting:
    * **Grid Size**: e.g., 5x5.
    * **Tokens Per Team**: e.g., 4 tokens each.
    * **Total Starting Value**: e.g., 100 points per team.
    * **Game Mode**: "Last Standing" or a set number of rounds (e.g., 10 rounds).

2.  **Prepare Your Team**: Each player secretly distributes their total starting value among their tokens and assigns a gender (M or F) to each one. Write this information directly on the tokens.
    * *Example*: For a 100-point total with 4 tokens, a player might create: M(35), F(25), M(20), F(20).

3.  **Define Cell Functions**: Before placing tokens, players must define a mathematical function for each cell on the board. You can agree on a single function for all cells or take turns assigning different functions to individual cells. Use your transparent sheet or separate paper to record the function for each grid coordinate.
    * **Function Examples**: Let 'V' be the token's current value.
        * **Growth Cell**: `V * 1.1` (Increases value by 10%)
        * **Trap Cell**: `V * 0` (Eliminates the token)
        * **Static Cell**: `V` (No change)
        * **Bonus Cell**: `V + 5` (Adds 5 to the value)
        * **Risk Cell**: `V^2 / 50` (High values grow fast, low values shrink)

4.  **Place Tokens**: Players take turns placing their tokens on their starting rows (e.g., the first row on their side of the board).

## Gameplay

The game is played in rounds. Each round consists of two phases: a **Movement Phase** where all tokens move, followed by a **Resolution Phase** where all interactions and cell functions are resolved.

### 1. Movement Phase (All Tokens Move)

During the movement phase, all tokens from both teams are moved to new cells. First, Player A moves all of their tokens, then Player B moves all of their tokens. **No interactions are resolved until every token on the board has completed its move.**

The direction for each token is determined randomly using two coin flips:
1.  **Flip 1 (Forward/Backward):** Flip a coin. Heads means the token moves one row forward (towards the opponent's side); tails means it moves one row backward.
2.  **Flip 2 (Left/Right):** Flip a second coin. Heads means the token moves one column to its right; tails means it moves one column to its left.

If a move would take a token off the board, it stays in its current position for that round.

### 2. Resolution Phase (All Cells Resolved)

After both players have moved all of their tokens, go through each cell on the board one by one to resolve interactions in the following order:

-   **A. Battles:** If a cell contains tokens from both players:
    1.  Sum the total value of all Red tokens in the cell.
    2.  Sum the total value of all Blue tokens in the cell.
    3.  The team with the lower total loses the battle. All of their tokens in that cell are removed from the game.
    4.  The winning team's tokens absorb the difference in value, divided proportionally among them.

-   **B. Reproduction:** If a cell contains multiple tokens from the *same team* that survived a battle (or if no battle occurred):
    1.  Look for pairs of Male (M) and Female (F) tokens.
    2.  For each M/F pair, the controlling player adds a new token to their team *in that same cell*.
    3.  The new token's value is the average of its parents' values.
    4.  Flip a coin to determine its gender (e.g., Heads = Female, Tails = Male).

-   **C. Cell Functions:** After all battles and reproductions in a cell are complete:
    1.  Apply the cell's predefined function to the value of **every** token currently in that cell (including newborn tokens).
    2.  Update each token's value accordingly.
    3.  If a token's value becomes 0 or less, it is removed from the game.

### Winning the Game

-   **Last Standing Mode**: The game ends immediately when a player has no tokens left on the board. The other player is the winner.
-   **Rounds Mode**: After the agreed-upon number of rounds, both players sum the total value of all of their tokens on the board. The player with the higher total value wins.