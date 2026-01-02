import {
  clearReq,
  registerReqExpect,
  quizInfoReqExpect,
  quizRemoveQuestionReqExpect,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
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

  questionId = expectSuccess(quizQuestion.body as { questionId: number }).questionId;
});

describe('Delete /v1/admin/quiz/:quizid/question/:questionid', () => {
  describe('Successful quiz question deletion', () => {
    test('returns empty object for valid question deletion', () => {
      const res = quizRemoveQuestionReqExpect(sessionId, quizId, questionId);
      expect(res.body).toStrictEqual({});

      const quizRes = quizInfoReqExpect(sessionId, quizId);
      expect(expectSuccess(quizRes.body).questions).toHaveLength(0);
    });
  });

  describe('Error Cases', () => {
    test('returns error when session is invalid', () => {
      quizRemoveQuestionReqExpect('invalid-session-id', quizId, questionId, 401, 'UNAUTHORISED');
    });

    test('returns error when session is empty', () => {
      quizRemoveQuestionReqExpect(undefined, quizId, questionId, 401, 'UNAUTHORISED');
    });

    test('returns error when quizId is invalid', () => {
      quizRemoveQuestionReqExpect(sessionId, quizId + 20, questionId, 403, 'INVALID_QUIZ_ID');
    });

    test('returns error when quiz does not belong to user', () => {
      const res2 = registerReqExpect('user2@email.com', 'B98765432', 'Bob', 'Jones');
      const otherSessionId = expectSuccess(res2.body).session;

      // Attempt to delete question in quiz owned by user1
      quizRemoveQuestionReqExpect(otherSessionId, quizId, questionId, 403, 'INVALID_QUIZ_ID');
    });

    test('returns error when questionId is invalid', () => {
      quizRemoveQuestionReqExpect(sessionId, quizId, questionId + 20, 400, 'INVALID_QUESTION_ID');
    });

    test('returns error when trying to delete an already deleted question', () => {
      quizRemoveQuestionReqExpect(sessionId, quizId, questionId);
      quizRemoveQuestionReqExpect(sessionId, quizId, questionId, 400, 'INVALID_QUESTION_ID');
    });
  });
});
