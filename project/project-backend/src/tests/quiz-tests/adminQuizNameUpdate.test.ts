import {
  quizInfoReqExpect,
  quizNameUpdateReqExpect,
  registerReqExpect,
  quizCreateReqExpect,
  clearReq,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let quizId: number;
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();

  const userRes = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(userRes.body).session;

  const quizRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
  quizId = expectSuccess(quizRes.body).quizId;
});
describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  describe('Success', () => {
    test('200 - Name updated', () => {
      quizNameUpdateReqExpect(sessionId, quizId, 'New name');

      const infoRes = quizInfoReqExpect(sessionId, quizId);
      expect(infoRes.body).toMatchObject({ name: 'New name' });
    });
  });
  test('200 - Name updated with 3 char name', () => {
    quizNameUpdateReqExpect(sessionId, quizId, 'New');

    const infoRes = quizInfoReqExpect(sessionId, quizId);
    expect(infoRes.body).toMatchObject({ name: 'New' });
  });
  test('200 - Name updated with 30 char name', () => {
    quizNameUpdateReqExpect(sessionId, quizId, 'a'.repeat(30));

    const infoRes = quizInfoReqExpect(sessionId, quizId);
    expect(infoRes.body).toMatchObject({ name: 'a'.repeat(30) });
  });
  quizNameUpdateReqExpect(undefined, quizId, 'New name', 401, 'UNAUTHORISED');
  quizNameUpdateReqExpect(undefined, quizId, 'New name', 401, 'UNAUTHORISED');

  describe('Id failure', () => {
    test('401 - UNAUTHORISED - sessionId is empty', () => {
      quizNameUpdateReqExpect(undefined, quizId, 'New name', 401, 'UNAUTHORISED');
    });

    test('401 - UNAUTHORISED - sessionId is invalid', () => {
      quizNameUpdateReqExpect('invalidSessionId', quizId, 'New name', 401, 'UNAUTHORISED');
    });

    test('403 - INVALID_QUIZ_ID - quiz does not exist', () => {
      const nonExistentQuizId = 2;
      quizNameUpdateReqExpect(sessionId, nonExistentQuizId, 'New name', 403, 'INVALID_QUIZ_ID');
    });

    test('403 - INVALID_QUIZ_ID - quiz not owned by user', () => {
      const res = registerReqExpect('user2@email.com', 'A12345678', 'Alicia', 'Smitten');
      const sessionId2 = (res.body as { session: string }).session;
      quizNameUpdateReqExpect(sessionId2, quizId, 'New name', 403, 'INVALID_QUIZ_ID');
    });
  });
  describe('Invalid description failure', () => {
    test('400 - Name > 30 char in length', () => {
      quizNameUpdateReqExpect(sessionId, quizId, 'a'.repeat(31), 400, 'INVALID_QUIZ_NAME');
    });

    test('400 - Name < 3 char in length', () => {
      quizNameUpdateReqExpect(sessionId, quizId, 'a'.repeat(1), 400, 'INVALID_QUIZ_NAME');
    });

    test('400 - Name contains invalid characters', () => {
      quizNameUpdateReqExpect(sessionId, quizId, ')&*(TOO', 400, 'INVALID_QUIZ_NAME');
    });

    test('400 - Duplicate quizName', () => {
      quizCreateReqExpect(sessionId, 'Quiz 2', 'Quiz 2 description');
      quizNameUpdateReqExpect(sessionId, quizId, 'Quiz 2', 400, 'DUPLICATE_QUIZ_NAME');
    });
  });
});
