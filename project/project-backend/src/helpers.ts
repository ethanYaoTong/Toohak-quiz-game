import { getData } from './dataStore';
import { DataStore, User, Quiz, Game } from './types/internalTypes';
import { UnauthorisedError, ForbiddenError, BadRequestError } from './toohakError';

/** Helper function that returns the user given a sessionId
 * @param { string } sessionId - The unique session identifier.
 * @returns { User } - returns User if session is valid, otherwise throws error.
 * @throws { UnauthorisedError } - if session is invalid or empty.
 *
 * Validation rules:
 * - sessionId must be provided and valid.
 */
export function getUserFromSessionId(sessionId: string | undefined): User {
  const data: DataStore = getData();
  const existingSession = data.sessions.find(s => s.sessionId === sessionId);

  // Checks if either a sessionId was not passed in header or
  // session passed in is invalid
  if (sessionId === undefined || existingSession === undefined) {
    throw new UnauthorisedError('UNAUTHORISED', 'Session is empty or invalid');
  }
  const user = data.users.find(u => u.userId === existingSession.userId)!;

  return user;
}

/**
 * Helper function that finds and returns a quiz object
 * based on the provided quizId.
 * @param { number } quizId - The unique identifier for the quiz.
 * @param { number } userId - The unique identifier for the user.
 * @return { Quiz } - returns quiz if found
 * @throws { ForbiddenError } - if quiz ID is invalid
 *
 * Validation rules:
 * - Quiz must exist in the data store.
 * - Quiz must belong to the user with the provided userId.
 */
export function getQuizById(
  quizId: number, userId: number
): Quiz {
  const data: DataStore = getData();
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (!quiz) {
    throw new ForbiddenError('INVALID_QUIZ_ID', 'Quiz ID does not refer to a valid quiz.');
  }

  if (quiz.ownerId !== userId) {
    throw new ForbiddenError('INVALID_QUIZ_ID', 'Quiz ID does not refer to a quiz that this user owns.');
  }

  return quiz;
}

/**
 * Helper function that retrieves a game from the datastore by its identifier.
 * @param { number } gameId - Identifier of the game to retrieve
 * @returns { Game } The matching game
 * @throws { BadRequestError } If no game exists with the provided ID.
 */
export function getGameById(gameId: number): Game {
  const data: DataStore = getData();
  const game = data.games.find(g => g.gameId === gameId);

  if (!game) {
    throw new BadRequestError('INVALID_GAME_ID', 'Game ID does not refer to a valid game.');
  }
  return game;
}

/**
 * Helper function that validates game states
 * @param { Game } game - The game
 * @param { string[] } compatibleStates - Array containing incompatible states
 * @throws { BadRequestError } - throws if game state is incompatible
 * Validation rules:
 * - Game is not in state given (dependent on which function called helper)
 */
export function validateGameStates(game: Game, compatibleStates: string[]) {
  if (!compatibleStates.includes(game.state)) {
    throw new BadRequestError(
      'INCOMPATIBLE_GAME_STATE',
      'Game is not in a state where question information can be viewed'
    );
  }
}
