import {
  clearReq,
  registerReqExpect,
  quizInfoReqExpect,
  quizRemoveQuestionReqExpectV2,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
  gameStartReqExpect,
  playerJoinReqExpect,
  SessionResult
} from '../requestHelpers';

import { expectSuccess } from '../testHelpers';

let quizId: number;
let questionId: number;
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();
  const res = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(res.body).session;

  const quizRes = quizCreateReqExpect(sessionId, 'Sample Quiz', 'This is a sample quiz description.');
  quizId = expectSuccess(quizRes.body).quizId;

  const quizQuestion = quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince Harry', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image.jpg',
    }
  );

  questionId = expectSuccess(quizQuestion.body).questionId;
});

describe('Delete /v1/admin/quiz/:quizid/question/:questionid', () => {
  describe('Successful quiz question deletion', () => {
    test('returns empty object for valid question deletion', () => {
      const res = quizRemoveQuestionReqExpectV2(sessionId, quizId, questionId);
      expect(res.body).toStrictEqual({});

      const quizRes = quizInfoReqExpect(sessionId, quizId);
      expect(expectSuccess(quizRes.body).questions).toHaveLength(0);
    });
  });

  describe('Error Cases', () => {
    test('returns error when session is invalid', () => {
      quizRemoveQuestionReqExpectV2('invalid-session-id', quizId, questionId, 401, 'UNAUTHORISED');
    });

    test('returns error when session is empty', () => {
      quizRemoveQuestionReqExpectV2(undefined, quizId, questionId, 401, 'UNAUTHORISED');
    });

    test('returns error when quizId is invalid', () => {
      quizRemoveQuestionReqExpectV2(sessionId, quizId + 20, questionId, 403, 'INVALID_QUIZ_ID');
    });

    test('returns error when quiz does not belong to user', () => {
      const res2 = registerReqExpect('user2@email.com', 'B98765432', 'Bob', 'Jones');
      const otherSessionId = expectSuccess(res2.body).session;

      // Attempt to delete question in quiz owned by user1
      quizRemoveQuestionReqExpectV2(otherSessionId, quizId, questionId, 403, 'INVALID_QUIZ_ID');
    });

    test('returns error when questionId is invalid', () => {
      quizRemoveQuestionReqExpectV2(sessionId, quizId, questionId + 20, 400, 'INVALID_QUESTION_ID');
    });

    test('returns error when trying to delete an already deleted question', () => {
      quizRemoveQuestionReqExpectV2(sessionId, quizId, questionId);
      quizRemoveQuestionReqExpectV2(sessionId, quizId, questionId, 400, 'INVALID_QUESTION_ID');
    });

    test('returns error when trying to delete a question within a quiz that has active games', () => {
      const game = gameStartReqExpect(sessionId, quizId, 1);
      const gameId = expectSuccess(game.body).gameId;
      playerJoinReqExpect(gameId, 'Kaiyu Katsu');
      quizRemoveQuestionReqExpectV2(sessionId, quizId, questionId, 400, 'ACTIVE_GAME_EXISTS');
    });
  });
});
