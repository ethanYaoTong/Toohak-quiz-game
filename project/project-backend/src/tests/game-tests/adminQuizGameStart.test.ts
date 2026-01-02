import {
  clearReq,
  registerReqExpect,
  gameStartReqExpect,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';

let sessionId: SessionResult;
let quizId: number;

beforeEach(() => {
  clearReq();

  // Register a default user for all tests
  const regRes = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(regRes.body).session;

  // Create a quiz
  const quizRes = quizCreateReqExpect(sessionId, 'Sample Quiz', 'This is a sample quiz description.');
  quizId = expectSuccess(quizRes.body).quizId;

  // Add a question
  quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Charles', correct: true },
        { answer: 'Harry', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image.jpg',
    }
  );
});

describe('adminQuizGameStart function', () => {
  test('successfully starts a new game', () => {
    const quizRes2 = quizCreateReqExpect(sessionId, 'Very active Quiz 2', 'This is a sample quiz description.');
    const quizId2 = expectSuccess(quizRes2.body).quizId;

    quizCreateQuestionReqExpect(
      sessionId,
      quizId2,
      {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          { answer: 'Charles', correct: true },
          { answer: 'Harry', correct: false },
        ],
        thumbnailUrl: 'http://example.com/image.jpg',
      }
    );

    for (let i = 0; i < 10; i++) {
      gameStartReqExpect(sessionId, quizId2, 3);
    }

    const result = gameStartReqExpect(sessionId, quizId, 3);

    expect(result.body).toStrictEqual({ gameId: expect.any(Number) });
  });

  describe('Testing error messages', () => {
    test('invalid session id', () => {
      gameStartReqExpect('invalidSessionId', quizId, 3, 401, 'UNAUTHORISED');
    });

    test('missing session id', () => {
      gameStartReqExpect(undefined, quizId, 3, 401, 'UNAUTHORISED');
    });

    test('autoStartNum too high', () => {
      gameStartReqExpect(sessionId, quizId, 51, 400, 'INVALID_GAME');
    });

    test('Maximum active games exceeded', () => {
      // Create 10 active games first
      for (let i = 0; i < 10; i++) {
        gameStartReqExpect(sessionId, quizId, 3);
      }
      // Next attempt should fail
      gameStartReqExpect(sessionId, quizId, 3, 400, 'MAX_ACTIVE_GAMES');
    });

    test('Quiz is empty', () => {
      const newQuizRes = quizCreateReqExpect(sessionId, 'Empty Quiz', 'This is a sample quiz description.');
      const emptyQuizId = expectSuccess(newQuizRes.body).quizId;
      gameStartReqExpect(sessionId, emptyQuizId, 3, 400, 'QUIZ_IS_EMPTY');
    });

    test('Invalid quiz id / user not owner', () => {
      gameStartReqExpect(sessionId, 999999, 3, 403, 'INVALID_QUIZ_ID');
    });
  });
});
