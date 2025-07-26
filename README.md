# Gowap: The Game of War and Peace

## Overview

Gowap (Game of War and Peace) is a strategic, turn-based simulation game where two teams of marbles compete on a grid. Each marble has a unique value and gender, which dictates its behavior in battles and reproductions. The game is highly customizable, allowing players to set everything from the grid size and number of marbles to the very functions that govern value changes on each cell of the board.

Players must balance aggression (battles) and growth (reproduction) to achieve victory, making for a dynamic and emergent gameplay experience.

## Features

-   **Highly Customizable Setup**: Configure grid size, number of marbles per team, and total initial value.
-   **Strategic Depth**: Assign each marble an initial value and a gender (Male or Female), influencing its role in the game.
-   **Two Game Modes**:
    -   **Last Standing**: The game ends when only one team has marbles left on the board.
    -   **Rounds**: The game runs for a predetermined number of rounds, and the team with the highest total value at the end wins.
-   **Advanced Customization**:
    -   **Custom Cell Functions**: Define a unique JavaScript function for each cell on the grid to modify the value of marbles that land on it.
    -   **Start Zones**: Designate specific starting areas for each team, allowing for tactical initial placements.
-   **Emergent Gameplay**: Simple rules for movement, battle, and reproduction lead to complex and unpredictable outcomes.

## Online Game Rules

### Getting Started

1.  **Choose Game Mode**: Select either "Single Player" to play against a configurable opponent or "Gauntlet Mode" to challenge other players on the platform.
2.  **Configure the Game**:
    -   **Grid Size**: Choose the dimensions of the game board (e.g., 5x5, 9x9).
    -   **Number of Marbles**: Select how many marbles each team will start with.
    -   **Distribute Value**: Assign an initial value to each of your marbles. The sum of these values must equal a predetermined total (e.g., 100).
    -   **Assign Gender**: Set each marble to be either Male (M) or Female (F).
    -   **Place Marbles**: Position your marbles on the designated starting cells.
    -   **(Optional) Cell Functions**: Advanced users can edit the JavaScript function of any cell to create unique effects on marble values.

### Basic Gameplay

The game proceeds in automated turns. Each turn consists of a Movement Phase and a Resolution Phase.

1.  **Movement Phase**:
    -   All living marbles move one space to a random diagonal cell.
    -   If the "wrap around" option is enabled, marbles moving off one edge will appear on the opposite side. Otherwise, they will stop at the edge.

2.  **Resolution Phase**:
    -   After all marbles have moved, the interactions on each cell are resolved.
    -   **Battle (War)**: If marbles from opposing teams occupy the same cell, a battle occurs.
        -   The total value of all marbles for each team on the cell is summed up.
        -   The team with the lower total value loses, and all of its marbles on that cell are eliminated from the game.
        -   The winning team's marbles absorb the difference between the two totals, distributed proportionally to their value.
    -   **Reproduction (Peace)**: If male and female marbles from the *same team* occupy the same cell, they reproduce.
        -   For each male/female pair, a new marble is created on that cell.
        -   The new marble's value is the average of its two parents' values. Its gender is assigned randomly.
    -   **Cell Function**: After battles and reproduction, the value of every surviving marble on a cell is modified by that cell's function. The default function slightly increases a marble's value. If a function results in a negative value, the marble is eliminated.

3.  **Winning the Game**:
    -   In **Last Standing** mode, you win by eliminating all of the opponent's marbles.
    -   In **Rounds** mode, you win by having the highest total value of all your marbles when the final round is complete.

## Development

This game was built using:
-   React
-   TypeScript
-   Vite
-   Tailwind CSS

## License

This project is licensed under the MIT License.

## Contact

randomplayables@proton.me