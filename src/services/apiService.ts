/**
 * API Service for connecting with the RandomPlayables platform (Gowap version)
 * Handles session management and data storage, modeled after successful integrations
 * like GothamLoops and Apophenia.
 */

// This now correctly uses the proxy for development and a real URL for production
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://randomplayables.com/api'
  : '/api';

console.log("Using API base URL:", API_BASE_URL);

// Game ID for Gowap, loaded from environment variables
const GAME_ID = import.meta.env.VITE_GAME_ID;

// Session storage keys specific to Gowap
const SESSION_STORAGE_KEY = 'gowapGameSession';
const SESSION_CREATION_TIME_KEY = 'gowapGameSessionCreationTime';

/**
 * Extracts authentication and survey context from the URL query parameters.
 * This allows the game to be launched with user context from the main platform.
 * @returns {Object} Context object with token, userId, username, etc.
 */
function getContextFromURL() {
  if (typeof window === 'undefined') {
    return { token: null, userId: null, username: null, surveyMode: false, questionId: null };
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('authToken');
  const userId = urlParams.get('userId');
  const username = urlParams.get('username');
  const surveyMode = urlParams.get('surveyMode') === 'true';
  const questionId = urlParams.get('questionId');
  
  console.log("Auth & Survey params extracted:", { 
    token: !!authToken, 
    userId, 
    username,
    surveyMode,
    questionId
  });
  
  return { token: authToken, userId, username, surveyMode, questionId };
}

// We use a Promise to ensure multiple simultaneous calls wait for the same result,
// preventing race conditions during React's StrictMode double-mounting.
let sessionInitPromise: Promise<any> | null = null;

/**
 * Initializes a game session with the platform.
 * It ensures that only one session initialization request is in flight at a time.
 * @returns {Promise<any>} A promise that resolves with the session information.
 */
export async function initGameSession(): Promise<any> {
  if (sessionInitPromise) {
    console.log("Session initialization already in progress, waiting for result...");
    return sessionInitPromise;
  }

  sessionInitPromise = (async () => {
    try {
      // Check for a very recent session to handle React StrictMode's double-mounting
      const lastCreationTime = localStorage.getItem(SESSION_CREATION_TIME_KEY);
      const currentSession = localStorage.getItem(SESSION_STORAGE_KEY);
      const now = Date.now();
      
      if (lastCreationTime && currentSession) {
        const timeSinceCreation = now - parseInt(lastCreationTime);
        if (timeSinceCreation < 3000) { // 3 seconds threshold
          console.log(`Using recently created session (${timeSinceCreation}ms ago)`);
          return JSON.parse(currentSession);
        }
      }
      
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      const { token, userId, username, surveyMode, questionId } = getContextFromURL();
      
      console.log("Initializing new game session with platform for Gowap...");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/game-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          gameId: GAME_ID,
          passedUserId: userId,
          passedUsername: username,
          surveyMode: surveyMode,
          surveyQuestionId: questionId
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn(`Could not connect to RandomPlayables platform. Status: ${response.status}. Using local session.`);
        const localSession = {
          sessionId: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId || null,
          username: username || null,
          isGuest: !userId,
          gameId: GAME_ID
        };
        
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
        localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());
        return localSession;
      }
      
      const session = await response.json();
      console.log("Created new game session:", session);
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());
      
      // If in survey mode, notify the parent window
      if (surveyMode && window.parent) {
        console.log('Game is in survey mode. Posting session data to parent window.');
        window.parent.postMessage({ type: 'GAME_SESSION_CREATED', payload: session }, '*');
      }

      return session;
    } catch (error) {
      console.error('Error initializing game session:', error);
      const { userId, username } = getContextFromURL();
      const localSession = {
        sessionId: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId: userId || null,
        username: username || null,
        isGuest: !userId,
        gameId: GAME_ID
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, Date.now().toString());
      return localSession;
    } finally {
      setTimeout(() => {
        sessionInitPromise = null;
      }, 5000);
    }
  })();
  
  return sessionInitPromise;
}

/**
 * Saves game data for a specific turn/event to the platform.
 * @param {number} turnNumber - The current turn number, which acts as the 'roundNumber'.
 * @param {any} turnData - The data object for the turn.
 * @returns {Promise<any | null>} A promise resolving to the server's response or null.
 */
export async function saveGameData(turnNumber: number, turnData: any): Promise<any | null> {
  try {
    const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionString) {
      throw new Error('No active game session found in localStorage');
    }
    const session = JSON.parse(sessionString);
    
    // Log data to console for development/debugging and research quality check
    console.log('Saving turn data:', { turnNumber, turnData, session });
    
    if (session.sessionId.startsWith('local-')) {
      console.log('Using local session, storing in localStorage');
      const offlineData = JSON.parse(localStorage.getItem('gowapOfflineGameData') || '[]');
      offlineData.push({ turnNumber, turnData, timestamp: new Date().toISOString() });
      localStorage.setItem('gowapOfflineGameData', JSON.stringify(offlineData));
      return { success: true, offline: true };
    }
    
    const { token, userId, username } = getContextFromURL();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/game-data`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        sessionId: session.sessionId,
        roundNumber: turnNumber,
        roundData: turnData,
        ...(userId && { passedUserId: userId }),
        ...(username && { passedUsername: username })
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error saving game data:', errorData);
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Server response from saveGameData:', result);
    return result;
  } catch (error) {
    console.error('Error saving game data:', error);
    // Fallback to local storage on error
    const offlineData = JSON.parse(localStorage.getItem('gowapOfflineGameData') || '[]');
    offlineData.push({ turnNumber, turnData, timestamp: new Date().toISOString(), error: (error as Error).message });
    localStorage.setItem('gowapOfflineGameData', JSON.stringify(offlineData));
    return { success: false, offline: true, error: (error as Error).message };
  }
}
