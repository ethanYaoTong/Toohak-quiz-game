import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizListReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let quizId: number;
let quizId2: number;
let sessionId: SessionResult;
let sessionId2: SessionResult;

beforeEach(() => {
  // Clear data before each test
  clearReq();

  // Register a default user for all tests
  const res = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(res.body).session;

  // Register a second user with no quizzes
  const res2 = registerReqExpect('user2@email.com', 'A12345678', 'Kaiyu', 'Katsu');
  sessionId2 = expectSuccess(res2.body).session;

  // Create a quiz for first user
  const quizRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
  quizId = expectSuccess(quizRes.body).quizId;

  // Create a second quiz for first user
  const quizRes2 = quizCreateReqExpect(sessionId, 'Quiz 2', 'Quiz 2 description');
  quizId2 = expectSuccess(quizRes2.body).quizId;
});

describe('adminQuizList function', () => {
  describe('Success Cases', () => {
    test('successfully returns all quizzes for a valid user', () => {
      const listRes = quizListReqExpect(sessionId);

      const expectedQuizzes = { quizzes: [
        { quizId: quizId, name: 'Quiz 1' },
        { quizId: quizId2, name: 'Quiz 2' },
      ] };

      expect(listRes.body).toStrictEqual(expectedQuizzes);
    });

    test('returns empty array if user has no quizzes', () => {
      // Consider user 2 who has no users
      const listRes = quizListReqExpect(sessionId2);
      expect(listRes.body).toStrictEqual({ quizzes: [] });
    });

    test('only returns quizzes belonging to the specified user', () => {
      // User 2 creates their first quiz
      quizCreateReqExpect(sessionId2, 'Quiz 3', 'Quiz 3 description');

      // Access quiz list user 1 (we should not expect Quiz 3)
      const listRes = quizListReqExpect(sessionId);

      const expectedQuizzes = { quizzes: [
        { quizId: quizId, name: 'Quiz 1' },
        { quizId: quizId2, name: 'Quiz 2' },
      ] };

      expect(listRes.body).toStrictEqual(expectedQuizzes);
    });
  });

  describe('Error Cases', () => {
    test('invalid sessionId', () => {
      quizListReqExpect('invalidSessionId', 401, 'UNAUTHORISED');
    });

    test('empty session', () => {
      quizListReqExpect(undefined, 401, 'UNAUTHORISED');
    });
  });
});
