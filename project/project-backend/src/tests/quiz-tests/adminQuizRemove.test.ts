import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizRemoveReqExpect,
  quizListReqExpect,
  SessionResult
} from '../requestHelpers';
import { QuizListResponse } from '../../types/externalTypes';
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

describe('DELETE /v1/admin/quiz/:quizid', () => {
  describe('Testing error messages', () => {
    test('Invalid sessionId', () => {
      quizRemoveReqExpect('thisisatotallyvalidsessionmhm', quizId, 401, 'UNAUTHORISED');
    });

    test('Missing sessionId', () => {
      quizRemoveReqExpect(undefined, quizId, 401, 'UNAUTHORISED');
    });

    describe('Invalid quizId', () => {
      test('Quiz ID does not refer to a valid quiz', () => {
        quizRemoveReqExpect(sessionId, quizId + 1, 403, 'INVALID_QUIZ_ID');
      });

      test('Quiz ID does not refer to a quiz that this user owns', () => {
        // Register a second user
        const register2 = registerReqExpect('heisenberg@hermanos.com', 'jesseweneedtocook123', 'Walter', 'White');
        const session2 = expectSuccess(register2.body).session;

        quizRemoveReqExpect(session2, quizId, 403, 'INVALID_QUIZ_ID');
      });
    });
  });

  describe('Success', () => {
    test('Successfully deletes a quiz', () => {
      // Delete the quiz
      quizRemoveReqExpect(sessionId, quizId);

      // Check quiz list to confirm deletion
      const listRes = quizListReqExpect(sessionId);
      const list = listRes.body as QuizListResponse;
      expect(list.quizzes).toStrictEqual([]); // should now be empty
    });
  });
});
