import {
  quizInfoReqExpect,
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
describe('GET /v1/admin/quiz/{quizid}', () => {
  describe('Success', () => {
    test('200 - Info received', () => {
      const infoRes = quizInfoReqExpect(sessionId, quizId);
      expect(infoRes.body).toMatchObject({
        quizId: quizId,
        name: 'Quiz 1',
        description: 'Quiz 1 description',
      });
    });
  });
  describe('faliure', () => {
    test('401 - UNATHORISED - session is empty', () => {
      quizInfoReqExpect(undefined, quizId, 401, 'UNAUTHORISED');
    });

    test('401 - UNATHORISED - sessionId is invalid', () => {
      const invalidSessionId = 'aaa';
      quizInfoReqExpect(invalidSessionId, quizId, 401, 'UNAUTHORISED');
    });

    test('403 - INVALID_QUIZ_ID - quiz doesnt exist', () => {
      const nonExistentQuizId = 2;
      quizInfoReqExpect(sessionId, nonExistentQuizId, 403, 'INVALID_QUIZ_ID');
    });

    test('403 - INVALID_QUIZ_ID - quiz not owned by user', () => {
      const res = registerReqExpect('user2@email.com', 'A12345678', 'Alicia', 'Smitten');
      const sessionId2 = expectSuccess(res.body).session;
      quizInfoReqExpect(sessionId2, quizId, 403, 'INVALID_QUIZ_ID');
    });
  });
});
