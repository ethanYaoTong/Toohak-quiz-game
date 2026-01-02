import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizDescriptionUpdateReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let quizId: number;
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();

  const res = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(res.body).session;

  const quizRes = quizCreateReqExpect(sessionId, 'Sample Quiz', 'This is a sample quiz description.');
  quizId = expectSuccess(quizRes.body).quizId;
});

describe('PUT /v1/admin/quiz/:quizid/description', () => {
  test('returns error when session is invalid', () => {
    quizDescriptionUpdateReqExpect('invalid-session-id', quizId, 'Invalid user', 401, 'UNAUTHORISED');
  });

  test('returns error when session is empty', () => {
    quizDescriptionUpdateReqExpect(undefined, quizId, 'Invalid user', 401, 'UNAUTHORISED');
  });

  test('returns error when quizId is invalid', () => {
    quizDescriptionUpdateReqExpect(sessionId, quizId + 1, 'Invalid quiz', 403, 'INVALID_QUIZ_ID');
  });

  test('returns error when quiz does not belong to user', () => {
    // Create a different user
    const res2 = registerReqExpect('user2@email.com', 'B98765432', 'Bob', 'Jones');
    const otherSessionId = expectSuccess(res2.body).session;

    // Attempt to update quiz owned by user1
    quizDescriptionUpdateReqExpect(otherSessionId, quizId, 'Not owner', 403, 'INVALID_QUIZ_ID');
  });

  test('returns error when description is too long', () => {
    const longDescription = 'a'.repeat(101);
    quizDescriptionUpdateReqExpect(sessionId, quizId, longDescription, 400, 'INVALID_DESCRIPTION');
  });

  test('successfully updates description', () => {
    quizDescriptionUpdateReqExpect(sessionId, quizId, 'Updated description');
  });
});
