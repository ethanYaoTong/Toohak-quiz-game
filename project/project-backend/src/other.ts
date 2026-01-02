import { getData, saveData } from './dataStore';
import { DataStore } from './types/internalTypes';
import { EmptyObject } from './types/externalTypes';

/**
 * Reset the state of the application back to the start.
 * @returns An empty object
 */
export function clear(): EmptyObject {
  const data: DataStore = getData();
  data.users = [];
  data.quizzes = [];
  data.games = [];
  data.sessions = [];
  data.nextUserId = 1;
  data.nextQuizId = 1;
  data.nextGameId = 1;
  data.nextPlayerId = 1;
  data.players = [];
  saveData();
  return {};
}
