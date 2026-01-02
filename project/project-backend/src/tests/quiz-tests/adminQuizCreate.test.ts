import { clearReq, registerReqExpect, quizCreateReqExpect, SessionResult } from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let sessionId: SessionResult;

beforeEach(() => {
  // Clear data before each test
  clearReq();

  // Register a default user for all tests
  const res = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(res.body).session;
});

describe('POST /v1/admin/quiz', () => {
  describe('Error handling', () => {
    test('Unauthorised user for empty session', () => {
      // Clear again to remove session
      clearReq();

      quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description', 401, 'UNAUTHORISED');
    });

    test('Unauthorised user for invalid session', () => {
      quizCreateReqExpect('invalidSession', 'Quiz 1', 'Quiz 1 description', 401, 'UNAUTHORISED');
    });

    test.each([
      ['Invalid character: !', 'Quiz 1!'],
      ['Invalid character: _', 'Quiz_1'],
      ['Name less than 3 characters', 'Hi'],
      ['Name more than 30 characters', 'a'.repeat(50)],
    ])('%s', (_, invalidName) => {
      quizCreateReqExpect(sessionId, invalidName, 'Quiz 1 description', 400, 'INVALID_QUIZ_NAME');
    });

    test('Duplicate quiz name', () => {
      // First quiz
      quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');

      // Duplicate quiz
      quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description', 400, 'DUPLICATE_QUIZ_NAME');
    });

    test('Invalid description', () => {
      quizCreateReqExpect(sessionId, 'Quiz 1', 'a'.repeat(101), 400, 'INVALID_DESCRIPTION');
    });
  });

  describe('Successful quiz creation', () => {
    test('Simple quiz creation', () => {
      quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
    });

    test('Same quiz name, but different user', () => {
      // Register a second user
      const reg2 = registerReqExpect('user2@email.com', 'A12345678', 'Bob', 'Smith');
      const sessionId2 = expectSuccess(reg2.body).session;

      // User 1 creates quiz
      quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');

      // User 2 creates same name quiz — should be allowed
      quizCreateReqExpect(sessionId2, 'Quiz 1', 'Quiz 1 description');
    });
  });
});
