import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizRemoveReqExpectV2,
  quizListReqExpect,
  SessionResult,
  quizCreateQuestionReqExpect,
  gameStartReqExpect
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let quizId: number;
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();

  const res = registerReqExpect('ilove@1531.com', 'bonjour123', 'Ethan', 'Iusearchbtw');
  sessionId = expectSuccess(res.body).session;

  // Create a quiz first
  const quizRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
  quizId = expectSuccess(quizRes.body).quizId;
});

describe('DELETE /v2/admin/quiz/:quizid', () => {
  describe('Testing error messages', () => {
    test('Invalid sessionId', () => {
      quizRemoveReqExpectV2('thisisatotallyvalidsessionmhm', quizId, 401, 'UNAUTHORISED');
    });

    test('Missing sessionId', () => {
      quizRemoveReqExpectV2(undefined, quizId, 401, 'UNAUTHORISED');
    });

    describe('Invalid quizId', () => {
      test('Quiz ID does not refer to a valid quiz', () => {
        quizRemoveReqExpectV2(sessionId, quizId + 1, 403, 'INVALID_QUIZ_ID');
      });

      test('Quiz ID does not refer to a quiz that this user owns', () => {
        // Register a second user
        const register2 = registerReqExpect(
          'heisenberg@hermanos.com',
          'jesseweneedtocook123',
          'Walter',
          'White'
        );
        const session2 = expectSuccess(register2.body).session;

        quizRemoveReqExpectV2(session2, quizId, 403, 'INVALID_QUIZ_ID');
      });
    });

    test('ACTIVE_GAME_EXISTS when any game for this quiz is not in END state', () => {
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

      gameStartReqExpect(sessionId, quizId2, 3);

      // Attempting to remove the quiz should now fail with ACTIVE_GAME_EXISTS
      quizRemoveReqExpectV2(sessionId, quizId2, 400, 'ACTIVE_GAME_EXISTS');
    });
  });

  describe('Success', () => {
    test('Successfully deletes a quiz with no games', () => {
      // Delete the quiz (no games yet)
      quizRemoveReqExpectV2(sessionId, quizId);

      // Check quiz list to confirm deletion
      const listRes = quizListReqExpect(sessionId);
      const list = expectSuccess(listRes.body);
      expect(list.quizzes).toStrictEqual([]); // should now be empty
    });
  });
});
