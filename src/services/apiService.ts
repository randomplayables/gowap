const API_BASE_URL = import.meta.env.PROD
  ? 'https://randomplayables.com/api'
  : '/api';

const GAME_ID = import.meta.env.VITE_GAME_ID || 'gowap'; 

let sessionId: string | null = null;

export async function initGameSession(): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/game-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId: GAME_ID }),
        });
        if (!response.ok) {
            throw new Error(`Failed to init session, status: ${response.status}`);
        }
        const data = await response.json();

        // Check if sessionId is a valid string before assigning and returning
        if (typeof data.sessionId === 'string' && data.sessionId) {
            sessionId = data.sessionId; // Assign to module-scoped variable
            console.log(`Gowap session initialized: ${sessionId}`);
            return data.sessionId; // Return the value which is known to be a string here
        } else {
            // Throw an error if the response is malformed
            throw new Error('Invalid session ID received from server.');
        }

    } catch (error) {
        console.error("Could not initialize game session:", error);
        sessionId = `local-${Date.now()}`;
        return sessionId; // This path correctly returns a string
    }
}

export async function saveGameData(roundNumber: number, roundData: any) {
    if (!sessionId) {
        console.error("Session not initialized. Cannot save game data.");
        return;
    }
    try {
        await fetch(`${API_BASE_URL}/game-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, roundNumber, roundData }),
        });
    } catch (error) {
        console.error("Failed to save game data:", error);
    }
}