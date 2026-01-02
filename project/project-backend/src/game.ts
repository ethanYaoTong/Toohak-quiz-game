import { getData, saveData } from './dataStore';
import { DataStore, Game, GameAction, Quiz } from './types/internalTypes';
import { EmptyObject, GameDetails, GameList, GameResult } from './types/externalTypes';
import { getUserFromSessionId, getQuizById, validateGameStates } from './helpers';
import { computeGameResult, getPlayersInGame } from './player';
import { adminQuizInfo } from './quiz';
import { BadRequestError } from './toohakError';
import {
  scheduleCountdownTimer,
  scheduleQuestionTimer,
  cancelCountdownTimer,
  cancelQuestionTimer
} from './gameTimers';

/**
 * Retrieves active and inactive game ids (sorted in ascending order) for a quiz
 * @param { string | undefined } sessionId - The ID of the admin session initiating the game.
 * @param { number } quizId - The unique identifier of the quiz to start.
 * @returns { GameList } - An object containing the gameId for active and inactive games
 * @throws { UnauthorisedError } - If unauthorised
 * @throws { ForbiddenError } - If quiz ID is invalid
 */
export function adminQuizGames(
  sessionId: string | undefined,
  quizId: number
): GameList {
  const user = getUserFromSessionId(sessionId);
  const userId = user.userId;
  getQuizById(quizId, userId);

  const data = getData();

  const activeGames = data.games
    .filter(g => g.metadata.quizId === quizId && g.state !== 'END')
    .map(g => g.gameId).sort((a, b) => a - b);

  const inactiveGames = data.games
    .filter(g => g.metadata.quizId === quizId && g.state === 'END')
    .map(g => g.gameId).sort((a, b) => a - b);

  return {
    activeGames: activeGames,
    inactiveGames: inactiveGames
  };
}

/**
 * Starts a quiz game session as an admin.
 * @param { string | undefined } sessionId - The ID of the admin session initiating the game.
 * @param { number } quizId - The unique identifier of the quiz to start.
 * @param { number } autoStartNum - The number of players required before the game auto-starts.
 * @returns { { gameId: number } } - An object containing the generated game ID.
 * @throws { UnauthorisedError } - If unauthorised
 * @throws { ForbiddenError } - If quiz ID is invalid
 * @throws { BadRequestError } - If game is invalid, reached max activated games, or quiz is empty
 */
export function adminQuizGameStart(
  sessionId: string | undefined,
  quizId: number,
  autoStartNum: number
): { gameId: number } {
  const user = getUserFromSessionId(sessionId);
  const userId = user.userId;
  const quiz = getQuizById(quizId, userId);

  if (autoStartNum > 50) {
    throw new BadRequestError('INVALID_GAME', 'autoStartNum cannot be greater than 50');
  }

  const data: DataStore = getData();

  const activeGames = data.games.filter(g => g.metadata.quizId === quizId && g.state !== 'END');

  if (activeGames.length >= 10) {
    throw new BadRequestError('MAX_ACTIVE_GAMES', 'Maximum of 10 active games allowed per quiz.');
  }

  if (quiz.questions.length === 0) {
    throw new BadRequestError('QUIZ_IS_EMPTY', 'The quiz does not have any questions in it.');
  }

  // Create new game

  const newGameId = data.nextGameId;
  data.nextGameId++;

  const quizDetails = adminQuizInfo(sessionId, quizId);
  const quizDetailsCopy = JSON.parse(JSON.stringify(quizDetails));

  const newGame: Game = {
    gameId: newGameId,
    state: 'LOBBY',
    autoStartNum: autoStartNum,
    atQuestion: 0,
    questionOpenTimes: [],
    players: [],
    metadata: quizDetailsCopy
  };

  data.games.push(newGame);
  saveData();

  return { gameId: newGameId };
}

/**
 * Updates the state of the quiz game
 * @param { string } sessionId - The unique numerical identifier of the session.
 * @param { number } quizId - The unique numerical identifier of the quiz the game corresponds to.
 * @param { number} gameId - The unique numerical identifier of the game.
 * @param { string } action - The action command sent.
 * @returns { EmptyObject } - Returns an empty object `{ }` on successful game state update.
 * @throws { UnauthorisedError } - If unauthorised
 * @throws { ForbiddenError } - If quiz ID is invalid
 * @throws { BadRequestError } - If game ID/action is invalid or
 * game is in incompatible state
 */
export function adminQuizGameStateUpdate(
  sessionId: string | undefined,
  quizId: number,
  gameId: number,
  action: string
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const userId = validSession.userId;
  const quiz = getQuizById(quizId, userId);
  const game = getGameByIdWithinQuiz(gameId, quiz);

  const gameAction = validateGameAction(action);
  handleAction(game, gameAction);

  saveData();
  return { };
}

/**
 * Helper function
 * Finds and returns a game object
 * based on the provided gameId.
 * @param { number } gameId - The unique identifier for the game.
 * @param { Quiz } quiz - The quiz
 * @return { Game } - returns game if found.
 * @throws { BadRequestError } - throws if the game is not valid.
 * Validation rules:
 * - Game Id must refer to a valid game within this quiz
 */
function getGameByIdWithinQuiz(gameId: number, quiz: Quiz): Game {
  const data: DataStore = getData();

  const game = data.games.find(g => g.gameId === gameId && g.metadata.quizId === quiz.quizId);

  if (!game) {
    throw new BadRequestError(
      'INVALID_GAME_ID',
      'Game Id does not refer to a valid game within this quiz'
    );
  }

  return game;
}

/**
 * Helper function
 * Validates game actions
 * @param { string } action - The action command sent
 * @returns { GameAction } - returns action if valid.
 * @throws { BadRequestError } - throws if the action is not valid.
 */
function validateGameAction(action: string): GameAction {
  const validGameActions: GameAction[] = [
    'NEXT_QUESTION',
    'SKIP_COUNTDOWN',
    'GO_TO_ANSWER',
    'GO_TO_FINAL_RESULTS',
    'END',
  ];

  if (!validGameActions.includes(action as GameAction)) {
    throw new BadRequestError(
      'INVALID_ACTION',
      'Action provided is not a valid Action enum'
    );
  }

  return action as GameAction;
}

/**
 * Helper function
 * Handle a valid action to game.
 * @param { Game } game - The game being updated.
 * @param { GameAction } action - The validated action enum.
 * @throws { BadRequestError } - Throws if action enum cannot be applied in the current state.
 */
function handleAction(game: Game, action: GameAction) {
  const state = game.state;

  // ----- LOBBY -----
  if (state === 'LOBBY') {
    if (action === 'NEXT_QUESTION') {
      handleNextQuestion(game);
    } else if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- QUESTION_COUNTDOWN -----
  } else if (state === 'QUESTION_COUNTDOWN') {
    if (action === 'SKIP_COUNTDOWN') {
      handleSkipCountdown(game);
    } else if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- QUESTION_OPEN -----
  } else if (state === 'QUESTION_OPEN') {
    if (action === 'GO_TO_ANSWER') {
      handleGoToAnswer(game);
    } else if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- QUESTION_CLOSE -----
  } else if (state === 'QUESTION_CLOSE') {
    if (action === 'GO_TO_ANSWER') {
      handleGoToAnswer(game);
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      handleGoToFinalResult(game);
      game.state = 'FINAL_RESULTS';
    } else if (action === 'NEXT_QUESTION') {
      handleNextQuestion(game);
    } else if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- ANSWER_SHOW -----
  } else if (state === 'ANSWER_SHOW') {
    if (action === 'NEXT_QUESTION') {
      handleNextQuestion(game);
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      handleGoToFinalResult(game);
    } else if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- FINAL_RESULTS -----
  } else if (state === 'FINAL_RESULTS') {
    if (action === 'END') {
      handleEnd(game);
    } else {
      incompatible();
    }

  // ----- END -----
  } else if (state === 'END') {
    incompatible();
  }
}

/**
 * Helper function
 * Throws incompatible game state error
 * @throws { BadRequestError } - throws BadRequestError for INCOMPATIBLE_GAME_STATE
 */
function incompatible() {
  throw new BadRequestError(
    'INCOMPATIBLE_GAME_STATE',
    'Action enum cannot be applied in the current state'
  );
};

/**
 * Helper function that handles NEXT_QUESTION action
 * @param { Game } - Game
 */
export function handleNextQuestion(game: Game) {
  const numQuestions = game.metadata.numQuestions;
  if (game.atQuestion >= numQuestions) {
    incompatible();
  } else {
    game.atQuestion += 1;
    game.state = 'QUESTION_COUNTDOWN';
    scheduleCountdownTimer(game);
  }
}

/**
 * Helper function that handles SKIP_COUNTDOWN action
 * @param { Game } - game
 */
function handleSkipCountdown(game: Game) {
  cancelCountdownTimer(game);
  game.state = 'QUESTION_OPEN';
  game.questionOpenTimes.push(Date.now());
  scheduleQuestionTimer(game);
}

/**
 * Helper function that handles GO_TO_ANSWER action
 * @param { Game } - game
 */
function handleGoToAnswer(game: Game) {
  cancelQuestionTimer(game);
  game.state = 'ANSWER_SHOW';
}

/**
 * Helper function that handles GO_TO_FINAL_RESULTS action
 * @param { Game } - game
 */
function handleGoToFinalResult(game: Game) {
  game.atQuestion = 0;
  game.state = 'FINAL_RESULTS';
}

/**
 * Helper function that handles END action
 * @param { Game } - game
 */
function handleEnd(game: Game) {
  game.atQuestion = 0;
  cancelCountdownTimer(game);
  cancelQuestionTimer(game);
  game.state = 'END';
}

/**
 * Retrieves the current status of a specific game session for a quiz.
 * @param { string | undefined } sessionId - The user's session token.
 * @param { number } quizId - The unique numerical identifier of the quiz.
 * @param { number } gameId - The unique numerical identifier of the game session.
 * @returns { GameDetails }
 * Returns an object containing the game's current state, the current question position,
 * the list of players, and metadata about the game.
 * @throws { UnauthorisedError } - If unauthorised
 * @throws { ForbiddenError } - If quiz ID is invalid
 * @throws { BadRequestError } - If game ID is invalid
 */
export function adminQuizGameStatus(
  sessionId: string | undefined,
  quizId: number,
  gameId: number
): GameDetails {
  // Check session is valid
  const validSession = getUserFromSessionId(sessionId);
  const userId = validSession.userId;

  // Check quiz exists
  const quiz = getQuizById(quizId, userId);

  // Check gameId is valid
  const game = getGameByIdWithinQuiz(gameId, quiz);

  return {
    state: game.state,
    atQuestion: game.atQuestion,
    players: game.players,
    metadata: game.metadata
  };
}

/**
 * Get quiz game final results for a completed quiz game
 * @param { string | undefined } sessionId - The user's session token.
 * @param { number } quizId - The unique numerical identifier of the quiz to retrieve.
 * @param { number } gameId - The unique numerical identifier of the quiz game to retrieve results for.
 * @returns { GameResult } - Final results for all players
 * @throws { UnauthorisedError } - If unauthorised
 * @throws { ForbiddenError } - If quiz ID is invalid
 * @throws { BadRequestError } - If game ID is invalid or game is in an incompatible state
 */
export function adminQuizGameResults(
  sessionId: string | undefined,
  quizId: number,
  gameId: number
): GameResult {
  const data = getData();

  // Validate session and user permissions
  const user = getUserFromSessionId(sessionId);

  // Validate quiz ownership
  const quiz = getQuizById(quizId, user.userId);

  // Find and validate the game
  const game = getGameByIdWithinQuiz(gameId, quiz);

  // Validate game state
  validateGameStates(game, ['FINAL_RESULTS']);

  const playersInGame = getPlayersInGame(data, game);

  return computeGameResult(game, playersInGame);
}
