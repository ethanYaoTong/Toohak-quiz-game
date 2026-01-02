import request from 'sync-request-curl';
import config from '../config.json';
import {
  QuestionInput,
  ErrorResponse,
  EmptyObject,
  UserDetails,
  QuizDetails,
  QuizListResponse,
  PlayerQuestionInfo,
  PlayerStatus,
  GameDetails,
  GameResult,
  QuestionResult
} from '../types/externalTypes';

// Common helper result types
export type RequestResult<TSuccess> = { statusCode: number; body: TSuccess | ErrorResponse };
export type LoginResult = RequestResult<{ session: string }>;
export type SessionResult = string | undefined;
export type GameJoinResult = RequestResult<{ gameId: number }>;
export type GameListResult = RequestResult<{ activeGames: number[]; inactiveGames: number[] }>;

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

/**
 * Helper function for validating HTTP responses in tests.
 * This function checks that a response has the expected status code and body structure.
 * @param { Object } res - The response object containing the response body (as string or Buffer)
 * @param { string | Buffer } res.body - The response body as string or Buffer
 * @param { number } statusCode - The actual HTTP status code received from the response
 * @param { number } expectedStatusCode - The expected HTTP status code (typically 200 for success, 4xx/5xx for errors)
 * @param { string } expectedError - The expected error message (only used when expectedStatusCode is not 200)
 *
 * @returns An object containing:
 * - statusCode: The validated status code
 * - body: The parsed response body, which can be one of:
 * - Success responses (200): Various objects like { session }, { quizId }, { user }, etc.
 * - Error responses (non-200): ErrorResponse with { error, message }
 *
 */
function expectHelper(
  res: { body: string | Buffer },
  statusCode: number,
  expectedStatusCode: number,
  expectedError: string
): {
  statusCode: number;
  body:
    | { session: string }
    | EmptyObject
    | { quizId: number }
    | { user: UserDetails }
    | { gameId: number }
    | { activeGames: number[]; inactiveGames: number[] }
    | QuizListResponse
    | QuizDetails
    | GameDetails
    | GameResult
    | PlayerQuestionInfo
    | PlayerStatus
    | { questionId: number }
    | { playerId: number }
    | GameDetails;
} | ErrorResponse {
  const body = JSON.parse(res.body.toString());

  expect(statusCode).toStrictEqual(expectedStatusCode);

  if (expectedStatusCode === 200) {
    // successful response
    expect(body).toStrictEqual(expect.any(Object));
  } else {
    // error response
    expect(body).toStrictEqual({
      error: expectedError,
      message: expect.any(String),
    });
  }

  return {
    statusCode,
    body,
  };
}

// ========================================================================= //
// Clear route
// ========================================================================= //
/**
 * Sends a request to the server to clear all data.
 */
export function clearReq() {
  return request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
}

// ========================================================================= //
// Auth routes
// ========================================================================= //
/**
 * Sends a request to the server to register a new admin user.
 * @param { string } email - The user's email.
 * @param { string } password - The user's password.
 * @param { string } nameFirst - The user's first name.
 * @param { string } nameLast - The user's last name.
 * @returns { { statusCode: number, body: { session: string } | ErrorResponse } }
 */
export function registerReqExpect(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { session: string } | ErrorResponse } {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { session: string } | ErrorResponse };
}

/**
 * Sends a request to the server to log in an admin user.
 * @param { string } email - The user's email.
 * @param { string } password - The user's password.
 * @returns { { statusCode: number, body: { session: string } | ErrorResponse } }
 */
export function loginReqExpect(
  email: string,
  password: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { session: string } | ErrorResponse } {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password },
    timeout: TIMEOUT_MS
  });

  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { session: string } | ErrorResponse };
}
/**
 * Sends a request to the server to log out the current admin user.
 * @param { string | undefined } sessionId - The session ID of the logged-in user.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function logoutReqExpect(
  sessionId: string | undefined,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to fetch details of the logged-in user.
 * @param { string | undefined } sessionId - The session ID of the logged-in user.
 * @returns { { statusCode: number, body: { user: UserDetails } | ErrorResponse } }
 */
export function userDetailsReqExpect(
  sessionId: string | undefined,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { user: UserDetails } | ErrorResponse } {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details', {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { user: UserDetails } | ErrorResponse };
}

/**
 * Sends a request to the server to update the logged-in user's details.
 * @param { string | undefined } sessionId - The session ID of the logged-in user.
 * @param { string } email - New email.
 * @param { string } nameFirst - New first name.
 * @param { string } nameLast - New last name.
 * @returns { { statusCode: number, body: { user: UserDetails } | ErrorResponse } }
 */
export function userDetailsUpdateReqExpect(
  sessionId: string | undefined,
  email: string,
  nameFirst: string,
  nameLast: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { user: UserDetails } | ErrorResponse } {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
    headers: { session: sessionId },
    json: { email, nameFirst, nameLast },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { user: UserDetails } | ErrorResponse };
}

/**
 * Sends a request to the server to update the logged-in user's password.
 * @param { string | undefined } sessionId - The session ID of the logged-in user.
 * @param { string } oldPassword - The current password.
 * @param { string } newPassword - The new password.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function userPasswordUpdateReqExpect(
  sessionId: string | undefined,
  oldPassword: string,
  newPassword: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/password', {
    headers: { session: sessionId },
    json: { oldPassword, newPassword },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

// ========================================================================= //
// Quiz routes
// ========================================================================= //
/**
 * Sends a request to the server to create a new quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { string } name - Quiz name.
 * @param { string } description - Quiz description.
 * @returns { { statusCode: number, body: { quizId: number } | ErrorResponse } }
 */
export function quizCreateReqExpect(
  sessionId: string | undefined,
  name: string,
  description: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { quizId: number } | ErrorResponse } {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    headers: { session: sessionId },
    json: { name, description },
    timeout: TIMEOUT_MS,
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { quizId: number } | ErrorResponse };
}

/**
 * Sends a request to the server to create a new question in a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { QuestionInput['questionBody'] } question - Question body.
 * @returns { { statusCode: number, body: { questionId: number } | ErrorResponse } }
 */
export function quizCreateQuestionReqExpect(
  sessionId: string | undefined,
  quizid: number,
  question: QuestionInput['questionBody'],
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { questionId: number } | ErrorResponse } {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
    headers: { session: sessionId },
    json: { questionBody: question },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: { questionId: number } | ErrorResponse };
}

/**
 * Sends a request to the server to update a quiz description.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { string } description - New description.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizDescriptionUpdateReqExpect(
  sessionId: string | undefined,
  quizid: number,
  description: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/description`, {
    headers: { session: sessionId },
    json: { description },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to retrieve details of a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @returns { { statusCode: number, body: QuizDetails | ErrorResponse } }
 */
export function quizInfoReqExpect(
  sessionId: string | undefined,
  quizid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: QuizDetails | ErrorResponse } {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: QuizDetails | ErrorResponse };
}

/**
 * Sends a request to the server to retrieve a list of all quizzes.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @returns { { statusCode: number, body: QuizListResponse | ErrorResponse } }
 */
export function quizListReqExpect(
  sessionId: string | undefined,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: QuizListResponse | ErrorResponse } {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: QuizListResponse | ErrorResponse };
}

/**
 * Sends a request to the server to update a quiz name.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { string } name - New name.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizNameUpdateReqExpect(
  sessionId: string | undefined,
  quizid: number,
  name: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/name`, {
    headers: { session: sessionId },
    json: { name },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to delete a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizRemoveReqExpect(
  sessionId: string | undefined,
  quizid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to delete a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizRemoveReqExpectV2(
  sessionId: string | undefined,
  quizid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to delete a question from a quiz V2.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } questionid - Question ID.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizRemoveQuestionReqExpectV2(
  sessionId: string | undefined,
  quizid: number,
  questionid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizid}/question/${questionid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to delete a question from a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } questionid - Question ID.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizRemoveQuestionReqExpect(
  sessionId: string | undefined,
  quizid: number,
  questionid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to update the thumbnail of a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { string } thumbnailUrl - New thumbnail URL.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizThumbnailUpdateReqExpect(
  sessionId: string | undefined,
  quizid: number,
  thumbnailUrl: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/thumbnail`, {
    headers: { session: sessionId },
    json: { thumbnailUrl: thumbnailUrl },
    timeout: TIMEOUT_MS
  });

  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to the server to update a question in a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } questionid - Question ID.
 * @param { QuestionInput['questionBody']} question - Updated question body.
 * @returns { { statusCode: number, body: EmptyObject | ErrorResponse } }
 */
export function quizUpdateQuestionReqExpect(
  sessionId: string | undefined,
  quizid: number,
  questionid: number,
  question: QuestionInput['questionBody'],
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionid}`, {
    headers: { session: sessionId },
    json: { questionBody: question },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

// ========================================================================= //
// Game routes
// ========================================================================= //
/**
 * Sends a request to the server to retrieve active and inactive games for a quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { GameListResult }
 */
export function gameListReqExpect(
  sessionId: string | undefined,
  quizid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): GameListResult {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/games`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as GameListResult;
}

/**
 * Sends a request to the server to start a new game for a given quiz.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } autoStartNum - Number of players required before auto-start.
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { { statusCode: number; body: { gameId: number } | ErrorResponse } }
 */
export function gameStartReqExpect(
  sessionId: string | undefined,
  quizid: number,
  autoStartNum: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { gameId: number } | ErrorResponse } {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/game/start`, {
    headers: { session: sessionId },
    json: { autoStartNum },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: { gameId: number } | ErrorResponse };
}

/**
 * Sends a request to the server to game state
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } gameId- Game ID
 * @param { number } action - The game action command requested
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { { statusCode: number; body: { gameId: number } | ErrorResponse } }
 */
export function gameStateUpdateReqExpect(
  sessionId: string | undefined,
  quizid: number,
  gameid: number,
  action: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/game/${gameid}`, {
    headers: { session: sessionId },
    json: { action },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Makes a GET request to retrieve the status of a specific game session for a quiz.
 * This is a testing helper function that sends an HTTP request and validates the response.
 * @param { string | undefined } sessionId - The user's session token to include in request headers.
 * @param { number } quizid - The unique numerical identifier of the quiz.
 * @param { number } gameid - The unique numerical identifier of the game session.
 * @param { number } expectedStatusCode - The HTTP status code expected from the response.
 * @param { string } expectedError - The error message expected if the request fails.
 * @returns { { statusCode: number; body: GameDetails | ErrorResponse } }
 */
export function gameStatusReqExpect(
  sessionId: string | undefined,
  quizid: number,
  gameid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: GameDetails | ErrorResponse } {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/game/${gameid}`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS,
  });
  return expectHelper(res, res.statusCode, expectedStatusCode, expectedError) as { statusCode: number; body: GameDetails | ErrorResponse };
}

/**
 * Sends a request to the server to get final results of a quiz game.
 * @param { string | undefined } sessionId - Session ID of admin user.
 * @param { number } quizid - Quiz ID.
 * @param { number } gameid - Game ID.
 * @returns { { statusCode: number, body: ResultsFinal | ErrorResponse } }
 */
export function gameResultsReqExpect(
  sessionId: string | undefined,
  quizid: number,
  gameid: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: GameResult | ErrorResponse } {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/game/${gameid}/results`, {
    headers: { session: sessionId },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: GameResult | ErrorResponse };
}

// ========================================================================= //
// Player routes
// ========================================================================= //
/**
 * Allow a guest player to join a game
 * @param { number } gameId- Game ID
 * @param { number } action - The game action command requested
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { { statusCode: number; body: { gameId: number } | ErrorResponse } }
 */
export function playerJoinReqExpect(
  gameId: number,
  playerName: string,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: { playerId: number } | ErrorResponse } {
  const res = request('POST', SERVER_URL + '/v1/player/join', {
    json: { gameId, playerName },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: { playerId: number } | ErrorResponse };
}

/**
 * Sends a request to get the status of a player in a game.
 * @param { number } playerId - Player ID.
 * @param { number } expectedStatusCode - Expected HTTP status code.
 * @param { string } expectedError - Expected error type (if applicable).
 * @returns { { statusCode: number; body: PlayerStatus | ErrorResponse } }
 */
export function playerStatusReqExpect(
  playerId: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: PlayerStatus | ErrorResponse } {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}`,
    { timeout: TIMEOUT_MS });
  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: PlayerStatus | ErrorResponse };
};

/**
 * Get the information about a question that the guest player is on
 * @param { number } playerId - Unique identification for player
 * @param { number } questionPosition - Question position (starts at 1)
 */
export function playerQuestionInfoReqExpect(
  playerId: number,
  questionPosition: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: PlayerQuestionInfo | ErrorResponse } {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}`,
    { timeout: TIMEOUT_MS }
  );
  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: PlayerQuestionInfo | ErrorResponse };
}

/**
 * Sends a request to the server to submit a player's answer for a specific question.
 * @param { number } playerid - Player ID.
 * @param { number } questionPosition - Position of the question being answered.
 * @param { number[] } answerIds - Array of answer IDs selected by the player.
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { { statusCode: number; body: EmptyObject | ErrorResponse } }
 */
export function playerQuestionAnswerReqExpect(
  playerid: number,
  questionPosition: number,
  answerIds: number[],
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: EmptyObject | ErrorResponse } {
  const res = request('PUT', SERVER_URL + `/v1/player/${playerid}/question/${questionPosition}/answer`, {
    json: { answerIds },
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: EmptyObject | ErrorResponse };
}

/**
 * Sends a request to fetch results for a question for a specific player.
 * @param { number } playerId - Player ID.
 * @param { number } questionPosition - Question position (1-indexed).
 * @returns { { statusCode: number, body: QuestionResult | ErrorResponse } }
 */
export function playerQuestionResultsReqExpect(
  playerId: number,
  questionPosition: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): { statusCode: number; body: QuestionResult | ErrorResponse } {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}/results`, {
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as { statusCode: number; body: QuestionResult | ErrorResponse };
}

/**
 * Sends a request to the server to retrieve the final results for a game
 * that a particular player participated in.
 * @param { number } playerId - Player ID
 * @param { number } expectedStatusCode - The expected HTTP status code.
 * @param { string } expectedError - The expected error type (if applicable).
 * @returns { RequestResult<GameResult> }
 */
export function playerGameResultReqExpect(
  playerId: number,
  expectedStatusCode: number = 200,
  expectedError: string = 'OK'
): RequestResult<GameResult> {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/results`, {
    timeout: TIMEOUT_MS,
  });

  return expectHelper(
    res,
    res.statusCode,
    expectedStatusCode,
    expectedError
  ) as RequestResult<GameResult>;
}
