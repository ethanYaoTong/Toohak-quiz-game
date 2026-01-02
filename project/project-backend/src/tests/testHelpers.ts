import slync from 'slync';
import {
  registerReqExpect,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
  gameStartReqExpect,
  gameStateUpdateReqExpect,
  gameStatusReqExpect
} from './requestHelpers';
import { ErrorResponse } from '../types/externalTypes';

/**
 * Helper function that asserts that a response body is a successful payload,
 * not an ErrorResponse.
 * @param {T | ErrorResponse} body - The response body to validate.
 * @returns { T } The validated success payload.
 */
export function expectSuccess<T>(body: T | ErrorResponse): T {
  expect(body).not.toStrictEqual(
    expect.objectContaining({
      error: expect.any(String),
      message: expect.any(String),
    })
  );

  return body as T;
}

/**
 * Helper function creates a basic game
 * @returns { string, number, number, number } - { sessionId, quizId, gameId, questionId }
 */
export function createBasicGame(): { sessionId: string; quizId: number; gameId: number; questionId: number } {
  // Register user
  const regRes = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  const sessionId = expectSuccess(regRes.body).session;

  // Create quiz
  const quizRes = quizCreateReqExpect(sessionId, 'Sample Quiz', 'This is a sample quiz description.');
  const quizId = expectSuccess(quizRes.body).quizId;

  // Add one question
  const questionRes = quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      timeLimit: 1,
      points: 5,
      answerOptions: [
        { answer: 'Charles', correct: true },
        { answer: 'Harry', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image.jpg',
    }
  );
  const questionId = expectSuccess(questionRes.body).questionId;
  // Start game
  const gameStartRes = gameStartReqExpect(sessionId, quizId, 3);
  const gameId = expectSuccess(gameStartRes.body).gameId;

  return { sessionId, quizId, gameId, questionId };
}

/**
 * Helper function creates a complex game
 * @returns { string, number, number } - { sessionId, quizId, gameId }
 */
export function createComplexGame(): { sessionId: string; quizId: number; gameId: number } {
  // Register user
  const regRes = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  const sessionId = expectSuccess(regRes.body).session;

  // Create quiz
  const quizRes = quizCreateReqExpect(sessionId, 'Sample Quiz', 'This is a sample quiz description.');
  const quizId = expectSuccess(quizRes.body).quizId;

  // Add multiple questions
  quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      timeLimit: 1,
      points: 5,
      answerOptions: [
        { answer: 'Charles', correct: true },
        { answer: 'Harry', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image.jpg',
    }
  );

  quizCreateQuestionReqExpect(sessionId, quizId, {
    question: 'What is 2 + 2?',
    timeLimit: 1,
    points: 3,
    answerOptions: [
      { answer: '4', correct: true },
      { answer: '5', correct: false },
    ],
    thumbnailUrl: 'http://example.com/image2.jpg',
  });

  quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'What colour is the sky?',
      timeLimit: 1,
      points: 3,
      answerOptions: [
        { answer: 'Blue', correct: true },
        { answer: 'Green', correct: false },
      ],
      thumbnailUrl: 'http://example.com/sky.jpg',
    }
  );

  // Start game
  const gameStartRes = gameStartReqExpect(sessionId, quizId, 3);
  const gameId = expectSuccess(gameStartRes.body).gameId;

  return { sessionId, quizId, gameId };
}

// -----------------------------
// Game State Navigation Helpers
// -----------------------------
/**
 * Run a sequence of actions in order.
 */
export function runActions(
  sessionId: string,
  quizId: number,
  gameId: number,
  actions: string[]
) {
  for (const action of actions) {
    gameStateUpdateReqExpect(sessionId, quizId, gameId, action);
  }
}

/**
 * LOBBY -> QUESTION_COUNTDOWN
 */
export function goToQuestionCountdown(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  runActions(sessionId, quizId, gameId, ['NEXT_QUESTION']);
}

/**
 * LOBBY -> COUNTDOWN -> OPEN
 */
export function goToQuestionOpen(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  runActions(sessionId, quizId, gameId, ['NEXT_QUESTION', 'SKIP_COUNTDOWN']);
}

/**
 * LOBBY -> COUNTDOWN -> (timer) -> OPEN -> (timer) -> CLOSE
 * but we only require the OPEN->CLOSE timer.
 */
export function goToQuestionCloseViaTimer(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  goToQuestionOpen(sessionId, quizId, gameId);

  const gameStateRes = gameStatusReqExpect(sessionId, quizId, gameId);
  const game = expectSuccess(gameStateRes.body);

  const atQuestion = game.atQuestion;
  const timeLimit = game.metadata.questions[atQuestion - 1].timeLimit;

  slync(timeLimit * 1000);
}

/**
 * LOBBY -> COUNTDOWN -> OPEN -> ANSWER_SHOW
 */
export function goToAnswerShow(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  runActions(sessionId, quizId, gameId, [
    'NEXT_QUESTION',
    'SKIP_COUNTDOWN',
    'GO_TO_ANSWER',
  ]);
}

/**
 * LOBBY -> COUNTDOWN -> OPEN -> ANSWER_SHOW -> FINAL_RESULTS
 */
export function goToFinalResults(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  goToAnswerShow(sessionId, quizId, gameId);
  runActions(sessionId, quizId, gameId, ['GO_TO_FINAL_RESULTS']);
}

/**
 * From ANY state -> END
 */
export function goToEnd(
  sessionId: string,
  quizId: number,
  gameId: number
) {
  runActions(sessionId, quizId, gameId, ['END']);
}
