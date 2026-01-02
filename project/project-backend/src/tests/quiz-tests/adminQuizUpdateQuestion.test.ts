import slync from 'slync';
import {
  quizUpdateQuestionReqExpect,
  quizInfoReqExpect,
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let quizId: number;
let sessionId: SessionResult;
let questionId: number;

beforeEach(() => {
  clearReq();
  const userRes = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(userRes.body).session;

  const quizRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
  quizId = expectSuccess(quizRes.body).quizId;

  const res = quizCreateQuestionReqExpect(
    sessionId,
    quizId,
    {
      question: 'Who is the Monarch of England??',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Prince Harry', correct: false },
      ],
      thumbnailUrl: 'http://example.com/image.jpg',
    }
  );
  questionId = expectSuccess(res.body).questionId;
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  describe('Success cases', () => {
    test('Successful Question Update', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'What is 1 + 1?',
          timeLimit: 7,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        }
      );

      const infoRes = quizInfoReqExpect(sessionId, quizId);
      expect(infoRes.body).toMatchObject({
        timeLimit: 7
      });
    });
  });
  describe('Validation Errors', () => {
    test('fails when question is too short', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'hi',
          timeLimit: 7,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('time limit less then 0', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: -7,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_TIMELIMIT'
      );
    });
    test('Total time limit more then 3 min', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_TIMELIMIT'
      );
    });
    test('fails with invalid points', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('fails with too few answers', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '2', correct: true },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('fails with duplicate answers', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '2', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('fails when no correct answer is provided', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '2', correct: false },
            { answer: '2', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('fails when thumbnail is empty', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '1', correct: true },
            { answer: '2', correct: false },
          ],
          thumbnailUrl: '',
        },
        400,
        'INVALID_QUESTION'
      );
    });
    test('Invalid question id', () => {
      const invalidQuestionId = 123131312;
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        invalidQuestionId,
        {
          question: 'whats 1 + 1',
          timeLimit: 181,
          points: 200,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '2', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION_ID'
      );
    });
    test('fails when thumbnail has invalid extension', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'Who is the Monarch of England?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Charles', correct: true },
            { answer: 'Harry', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.gif',
        },
        400,
        'INVALID_THUMBNAIL'
      );
    });
    test('fails when thumbnail has invalid protocol', () => {
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'Who is the Monarch of England?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Charles', correct: true },
            { answer: 'Harry', correct: false },
          ],
          thumbnailUrl: 'ftp://example.com/image.jpg',
        },
        400,
        'INVALID_THUMBNAIL'
      );
    });
  });
  describe('Authorisation Errors', () => {
    test('401 - UNAUTHORISED - sessionId doesnt exist', () => {
      // Clear again to remove session
      clearReq();
      quizUpdateQuestionReqExpect(
        sessionId,
        quizId,
        questionId,
        {
          question: 'What is 1 + 1?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        401,
        'UNAUTHORISED'
      );
    });

    test('401 - UNAUTHORISED - sessionId is invalid', () => {
      quizUpdateQuestionReqExpect(
        'invalidSessionId',
        quizId,
        questionId,
        {
          question: 'What is 1 + 1?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        401,
        'UNAUTHORISED'
      );
    });

    test('403 - INVALID_QUIZ_ID - quiz doesnt exist', () => {
      const nonExistentQuizId = 2;
      quizUpdateQuestionReqExpect(
        sessionId,
        nonExistentQuizId,
        questionId,
        {
          question: 'What is 1 + 1?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        403,
        'INVALID_QUIZ_ID'
      );
    });

    test('403 - INVALID_QUIZ_ID - quiz not owned by user', () => {
      const res = registerReqExpect('user2@email.com', 'A12345678', 'Alicia', 'Smitten');
      const sessionId2 = expectSuccess(res.body).session;

      quizUpdateQuestionReqExpect(
        sessionId2,
        quizId,
        questionId,
        {
          question: 'What is 1 + 1?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: '2', correct: true },
            { answer: '3', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        403,
        'INVALID_QUIZ_ID'
      );
    });
  });

  test('Successfully updates timeLastEdited when a question is added', () => {
    const quizBefore = quizInfoReqExpect(sessionId, quizId);

    const timeLastEditedBefore = expectSuccess(quizBefore.body).timeLastEdited;

    slync(1000);
    const now = Math.floor(Date.now() / 1000);

    quizUpdateQuestionReqExpect(
      sessionId,
      quizId,
      questionId,
      {
        question: 'Who is the Monarch of England?',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'King Charles', correct: true },
          { answer: 'Prince Harry', correct: false },
        ],
        thumbnailUrl: 'http://example.com/image.jpg',
      }
    );

    const quizAfter = quizInfoReqExpect(sessionId, quizId);
    const timeLastEditedAfter = expectSuccess(quizAfter.body).timeLastEdited;

    expect(timeLastEditedAfter).toBeGreaterThan(timeLastEditedBefore);
    expect(timeLastEditedAfter).toBeLessThanOrEqual(now + 1);
  });
});
