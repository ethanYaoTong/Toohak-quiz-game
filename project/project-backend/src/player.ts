import { getData, saveData } from './dataStore';
import { BadRequestError } from './toohakError';
import { Player, Game, DataStore, PlayerAnswers, Question } from './types/internalTypes';
import { PlayerStatus, PlayerQuestionInfo, EmptyObject, GameScore, GameResult, QuestionResult, PlayerAnswerResult } from './types/externalTypes';
import { getGameById, validateGameStates } from './helpers';
import { handleNextQuestion } from './game';

/**
 * Allows a player to join a game.
 * @param { number } gameId - Identifier of the game the player is joining
 * @param { string } playerName - Requested player name, or an empty string to auto-generate
 * @returns { number } - An object containing the newly allocated playerId
 * @throws { BadRequestError } - throws if player name/game ID is invalid,
 * or game is not in LOBBY state
 */
export function playerJoinGame(
  gameId: number,
  playerName: string
): { playerId: number } {
  const data: DataStore = getData();

  const game = getGameById(gameId);
  validateGameStates(game, ['LOBBY']);

  // Track names of players already in this game for quick uniqueness checks
  const existingNames = new Set<string>(game.players);

  // If the provided name is an empty string, generate one automatically
  let finalName = playerName;
  if (finalName === '') {
    finalName = generateUniquePlayerName();
  } else {
    // Otherwise, validate the provided name's characters
    if (!isValidPlayerName(finalName)) {
      throw new BadRequestError(
        'INVALID_PLAYER_NAME',
        'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
      );
    }

    // Name must also be unique among players already joined
    if (existingNames.has(finalName)) {
      throw new BadRequestError('INVALID_PLAYER_NAME', 'Name of user entered is not unique');
    }
  }

  const playerId = data.nextPlayerId;
  data.nextPlayerId++;

  data.players.push({
    playerId,
    gameId,
    playerName: finalName,
    answer: [],
    score: 0,
  });
  game.players.push(finalName);

  // If number of players is greater than or equal to autoStartNum, the game will autostart
  if (game.autoStartNum !== 0 && game.players.length >= game.autoStartNum) {
    handleNextQuestion(game);
  }

  saveData();

  return { playerId };
}

/**
 * Helper function
 * Generates a random, unique player name following the pattern:
 * - 5 unique lowercase letters (a-z)
 * - 3 unique digits (0-9)
 * @param { Set<string> } existingNames - Set of player names already taken in the game
 * @returns { string } A newly generated, unique player name
 */
function generateUniquePlayerName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const digits = '0123456789'.split('');

  // Generate a name and keep regenerating while there is a collision
  // with an existing player name.
  return buildRandomPlayerName(letters, digits);
}

/**
 * Helper function
 * Constructs a single candidate player name using 5 letters followed
 * by 3 digits.
 * @param { string[] } letters - Pool of characters to use for the alphabetic component
 * @param { string[] } digits - Pool of characters to use for the numeric component
 * @returns { string } A candidate player name matching the required pattern
 */
function buildRandomPlayerName(letters: string[], digits: string[]): string {
  const fiveLetters = pickUnique(letters, 5).join('');
  const threeDigits = pickUnique(digits, 3).join('');
  return `${fiveLetters}${threeDigits}`;
}

/**
 * Helper function
 * Randomly selects `count` distinct elements from the given array.
 * This function keeps picking until it has the required number of
 * unique items in `picked`.
 * @param { string[] } arr - Source array to pick from
 * @param { number } count - Number of unique elements to pick
 * @returns { string[] } An array containing `count` unique elements from `arr`
 */
function pickUnique(arr: string[], count: number): string[] {
  const picked: string[] = [];
  while (picked.length < count) {
    // Get a random index into the array
    const index = Math.floor(Math.random() * arr.length);
    const candidate = arr[index];
    // Only add the candidate if we haven't already picked it
    if (!picked.includes(candidate)) picked.push(candidate);
  }
  return picked;
}

/**
 * Helper function
 * Validates a player name against the allowed character set.
 * @param { string } name - Player name to validate
 * @returns { boolean } `true` if the name is valid; otherwise `false`.
 */
function isValidPlayerName(name: string): boolean {
  return /^[A-Za-z0-9 ]+$/.test(name);
}

/**
 * Gets the current status of a player in a game.
 * @param { number } playerId - The unique ID of the player.
 * @returns { { state: string; numQuestions: number; atQuestion: number } }
 * @throws { BadRequestError } - If the player ID is invalid.
 */
export function playerGetStatus(playerId: number): PlayerStatus {
  const player = getPlayerById(playerId);
  const game = getGameById(player.gameId);

  return {
    state: game.state,
    numQuestions: game.metadata.numQuestions,
    atQuestion: game.atQuestion
  };
}

/**
 * Helper function that returns the player given the playerId
 * @param { number } playerId - The unique identifier for the player
 * @return { Player } - The player object
 * @throws { BadRequestError } - throws if the playerId does not exist
 */
function getPlayerById(playerId: number): Player {
  const data: DataStore = getData();
  const player = data.players.find(p => p.playerId === playerId);

  if (!player) {
    throw new BadRequestError('INVALID_PLAYER_ID', 'Player ID does not exist.');
  }

  return player;
}

/**
 * Get the information about a question that the guest player is on
 * @param { number } playerId - The unique identifier for the player
 * @param { number } questionPosition - The question position
 * @return { Player } - The player object
 * @throws { BadRequestError } - throws if the playerId/position is invalid, or
 * if game state is incompatible.
 */
export function playerQuestionInfo(
  playerId: number,
  questionPosition: number
): PlayerQuestionInfo {
  const player = getPlayerById(playerId);
  const game = getGameById(player.gameId);

  validatePosition(game, questionPosition);

  const compatibleStates = [
    'QUESTION_OPEN',
    'QUESTION_CLOSE',
    'ANSWER_SHOW',
  ];
  validateGameStates(game, compatibleStates);

  const question = game.metadata.questions[questionPosition - 1];

  return {
    questionId: question.questionId,
    question: question.question,
    timeLimit: question.timeLimit,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answerOptions: question.answerOptions.map(a => ({
      answerId: a.answerId,
      answer: a.answer,
      colour: a.colour,
    })),
  };
}

/**
 * Helper function
 * Validates the question position
 * @param { Game } game - The game
 * @param { number } questionPosition - The question position
 * @throws { BadRequestError } - throws if the question position is invalid
 * Validation rules:
 * - If question position is not valid for the game this player is in
 * - If game is not currently on this question
 */
function validatePosition(game: Game, questionPosition: number) {
  const numQuestions = game.metadata.numQuestions;
  if (questionPosition < 0 || questionPosition > numQuestions) {
    throw new BadRequestError(
      'INVALID_POSITION',
      'Question position is not valid for this game'
    );
  }

  if (game.atQuestion !== questionPosition) {
    throw new BadRequestError(
      'INVALID_POSITION',
      'Game is not currently on this question'
    );
  }
}

/**
 * Records a player's answer submission for a specific question in an active game.
 * @param { number } playerId - The unique identifier of the player submitting the answer
 * @param { number } questionPosition - The 1-indexed position of the question being answered
 * @param { number[] }answerIds - Array of answer option IDs selected by the player
 * @returns { { } } An empty object on successful answer submission
 * @throws { BadRequestError } - if player ID/position/answer ID is invalid or
 * game state is incompatible
 */
export function playerQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]): EmptyObject {
  const player = getPlayerById(playerId);
  const game = getGameById(player.gameId);

  // INCOMPATIBLE_GAME_STATE
  validateGameStates(game, ['QUESTION_OPEN']);

  // INVALID_POSITION
  validatePosition(game, questionPosition);

  // INVALID_ANSWER_IDS
  validateAnswerIds(answerIds, game, questionPosition);

  // Check if question: questionPosition has been answered already
  player.answer = player.answer.filter(a => a.questionPosition !== questionPosition);

  // Add answers
  const answer: PlayerAnswers = {
    questionPosition: questionPosition,
    answerIds: answerIds,
    timeAnswered: Date.now()
  };
  player.answer.push(answer);
  saveData();
  return {};
}

/**
 * Helper function
 * Validates that the submitted answer IDs are valid for a specific question in a game.
 * @param { number[] } answerIds - Array of answer IDs submitted by the user
 * @param { Game } game - Game object containing metadata with questions and answer options
 * @param { number } questionPosition - 1-based position of the question being answered
 * @throws { BadRequestError } - if answerId is invalid
 */
function validateAnswerIds(answerIds: number[], game: Game, questionPosition: number) {
  if (answerIds.length < 1) {
    throw new BadRequestError('INVALID_ANSWER_IDS', 'Less than 1 answer ID was submitted');
  }

  if (answerIds.length !== new Set(answerIds).size) {
    throw new BadRequestError('INVALID_ANSWER_IDS', 'There are duplicate answer IDs provided');
  }

  const possibleAnswers = game.metadata.questions[questionPosition - 1].answerOptions;
  const possibleAnswerIds = new Set(possibleAnswers.map(obj => obj.answerId));
  if (answerIds.some(value => !possibleAnswerIds.has(value))) {
    throw new BadRequestError('INVALID_ANSWER_IDS', 'Answer IDs are not valid for this particular question');
  };
}

/**
 * Get the results for a particular question of the game a player is playing in.
 * @param { number } playerId - The unique identifier of the player.
 * @param { number } questionPosition - The position of the question (starts at 1).
 * @returns { QuestionResult } - The results for the question.
 * @throws { BadRequestError } - player ID/position is invalid or game state is incompatible
 */
export function playerQuestionResults(
  playerId: number,
  questionPosition: number
): QuestionResult {
  const data: DataStore = getData();

  const player = getPlayerById(playerId);
  const game = getGameById(player.gameId);

  // Check game state - must be in ANSWER_SHOW state
  validateGameStates(game, ['ANSWER_SHOW']);

  // Validate question position
  validatePosition(game, questionPosition);

  // Get the question (questionPosition is 1-indexed, array is 0-indexed)
  const question = game.metadata.questions[questionPosition - 1];

  // Get all players in this game
  const playersInGame = getPlayersInGame(data, game);

  // Create object to store all players and their scores
  const playerScores = new Map<number, number>();
  for (const p of playersInGame) {
    playerScores.set(p.playerId, 0);
  }

  return setupQuestionResult(question, playersInGame, questionPosition, playerScores, game);
};

/**
 * Helper function
 * Returns players in game
 * @param { DataStore } data - Stores all the files data
 * @param { Game } game - The game
 * @returns { Player[] } - Array with all the players
 */
export function getPlayersInGame(data: DataStore, game: Game): Player[] {
  return data.players.filter(p => p.gameId === game.gameId);
}

/**
 * Helper function
 * Builds the question-level result by awarding scaled scores and aggregating stats.
 * @param { Question } question - The quiz question being evaluated.
 * @param { Player[] } playersInGame - All players currently in this game instance.
 * @param { number } questionPosition - One-indexed position of the question.
 * @param { Map<number, number> } playerScores - Mutable map holding cumulative player scores.
 * @param { Game } game - The game context including metadata/state.
 * @returns { QuestionResult } Summary metrics for the question.
 */
function setupQuestionResult(question: Question, playersInGame: Player[], questionPosition: number, playerScores: Map<number, number>, game: Game) {
  const correctAnswerIds = new Set(
    question.answerOptions
      .filter(a => a.correct)
      .map(a => a.answerId)
  );

  const { answersForQuestion, correctResponses } = awardScoresForQuestion(
    question.points,
    playersInGame,
    questionPosition,
    correctAnswerIds,
    playerScores,
    game
  );

  return buildQuestionResult(
    question.questionId,
    answersForQuestion,
    correctResponses,
    playersInGame,
    questionPosition,
    game
  );
}

/**
 * Helper function
 * Process all answers for a single question and award scores
 * based on the order of correct responses.
 * @param { number } points - The point value of the question.
 * @param { Player[] } playersInGame - All players who participated in the game.
 * @param { number } questionPosition - The question position
 * @param { Set<number> } correctAnswerIds - Set of answerIds that are correct.
 * @param { Map<number, number> } playerScores - Mutable map of
 * playerId -> cumulative score to be updated in place.
 * @returns {{ answersForQuestion: PlayerAnswerResult[]; correctResponses: PlayerAnswerResult[] }}
 * The list of all answers for this question and the subset that were
 * completely correct.
 */
function awardScoresForQuestion(
  points: number,
  playersInGame: Player[],
  position: number,
  correctAnswerIds: Set<number>,
  playerScores: Map<number, number>,
  game: Game
): { answersForQuestion: PlayerAnswerResult[]; correctResponses: PlayerAnswerResult[] } {
  const answersForQuestion: PlayerAnswerResult[] = playersInGame
    .map((p) => {
      const ans = p.answer.find(a => a.questionPosition === position);
      return ans ? { player: p, ans } : null;
    })
    .filter((entry): entry is PlayerAnswerResult => entry !== null);

  const correctResponses: PlayerAnswerResult[] = answersForQuestion.filter(({ ans }) => {
    const selectedIds = ans.answerIds;

    if (selectedIds.length !== correctAnswerIds.size) {
      return false;
    }

    return selectedIds.every((id: number) => correctAnswerIds.has(id));
  });

  const sortedCorrectByTime = [...correctResponses].sort(
    (a, b) =>
      getAnswerTimeTaken(a.ans, position, game)
      - getAnswerTimeTaken(b.ans, position, game)
  );

  sortedCorrectByTime.forEach(({ player: p }, index) => {
    const rank = index + 1;
    const questionScore = Math.round(points / rank);
    const currentTotal = playerScores.get(p.playerId) ?? 0;
    playerScores.set(p.playerId, currentTotal + questionScore);
  });

  return { answersForQuestion, correctResponses };
}

/**
 * Helper function
 * Construct a QuestionResult object for a single question.
 * @param { number } questionId - Identifier of the question.
 * @param { PlayerAnswerResult[] } answersForQuestion - All submitted answers
 * for this question.
 * @param { CorrectResponse[] } correctResponses - Subset of answersForQuestion
 * that were completely correct.
 * @param { Player[] } playersInGame - All players who participated in the game.
 * @param { Game } game - The game
 * @returns { QuestionResult } Aggregated result metrics for this question.
 */
function buildQuestionResult(
  questionId: number,
  answersForQuestion: PlayerAnswerResult[],
  correctResponses: PlayerAnswerResult[],
  playersInGame: Player[],
  position: number,
  game: Game
): QuestionResult {
  const totalPlayerAnswers = answersForQuestion.length;

  const playersCorrect = correctResponses
    .map(({ player: p }) => p.playerName)
    .sort((a, b) => a.localeCompare(b));

  let averageAnswerTime: number;
  if (totalPlayerAnswers === 0) {
    averageAnswerTime = 0;
  } else {
    const totalTime = answersForQuestion.reduce(
      (sum, { ans }) => sum + getAnswerTimeTaken(ans, position, game),
      0
    );
    // Unanswered questions contribute 0 seconds for that player
    averageAnswerTime = Math.round((totalTime / totalPlayerAnswers) / 1000);
  }

  let percentCorrect: number;
  if (playersInGame.length === 0) {
    percentCorrect = 0;
  } else {
    percentCorrect = Math.round((correctResponses.length * 100) / playersInGame.length);
  }

  return {
    questionId,
    playersCorrect,
    averageAnswerTime,
    percentCorrect,
  };
}

/**
 * Helper Function
 * Computes the time taken for a player to answer a question, in milliseconds.
 * @param { PlayerAnswers } ans - Object containing player answer related data
 * @param { numbers } position - The question position
 * @param { Game } game - The game
 * @returns { number } - The question answer time
 */
function getAnswerTimeTaken(ans: PlayerAnswers, position: number, game: Game): number {
  const questionOpenTime = game.questionOpenTimes[position - 1];
  const diff = ans.timeAnswered - questionOpenTime;
  return diff;
}

/**
 * Computes the final results for the entire game that a given player
 * participated in.
 * @param { number } playerId - Identifier of the player in the game.
 * @returns { GameResult } Object containing ranked users and question
 * results for the game the player is in.
 * @throws { BadRequestError }
 * - INVALID_PLAYER_ID if playerId does not exist or is inconsistent
 * with the stored games.
 * - INCOMPATIBLE_GAME_STATE if the game is not in FINAL_RESULTS state.
 */
export function playerGameResults(
  playerId: number
): GameResult {
  const data: DataStore = getData();

  const player = getPlayerById(playerId);
  const game = getGameById(player.gameId);

  // Game must be in FINAL_RESULTS state
  validateGameStates(game, ['FINAL_RESULTS']);

  const playersInGame = getPlayersInGame(data, game);

  return computeGameResult(game, playersInGame);
}

/**
 * Helper function
 * Compute the final GameResult object for a specific game
 * and a set of players.
 * @param { Game } game - The game whose results are being computed.
 * @param { Player[] } playersInGame - All players who participated in
 * the given game.
 * @returns { GameResult } Final scores and per-question results for
 * the supplied game and players.
 */
export function computeGameResult(game: Game, playersInGame: Player[]): GameResult {
  const playerScores = new Map<number, number>();
  for (const p of playersInGame) {
    playerScores.set(p.playerId, 0);
  }

  const questionResults: GameResult['questionResults'] = [];
  const questions = game.metadata.questions;
  const numQuestions = game.metadata.numQuestions;

  for (let questionPosition = 1; questionPosition <= numQuestions; questionPosition++) {
    const question = questions[questionPosition - 1];

    const questionResult = setupQuestionResult(question, playersInGame, questionPosition, playerScores, game);

    questionResults.push(questionResult);
  }

  const usersRankedByScore = buildUsersRankedByScore(playersInGame, playerScores);

  return {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults
  };
}

/**
 * Helper function
 * Build the ranked user list from the final per-player scores.
 * Produces an array of GameScore entries sorted by:
 * 1. Descending score.
 * 2. Ascending playerName (for deterministic ordering when tied).
 *
 * @param { Player[] } playersInGame - All players who participated in the game.
 * @param { Map<number, number> } playerScores - Map from playerId to total score.
 * @returns { GameScore[] } Players ranked by score.
 */
function buildUsersRankedByScore(
  playersInGame: Player[],
  playerScores: Map<number, number>
): GameScore[] {
  return playersInGame
    .map(p => ({
      playerName: p.playerName,
      score: playerScores.get(p.playerId) ?? 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Tie-breaker by name
      return a.playerName.localeCompare(b.playerName);
    });
}
