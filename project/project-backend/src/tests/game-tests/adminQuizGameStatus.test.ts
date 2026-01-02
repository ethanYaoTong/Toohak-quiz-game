import {
  quizCreateReqExpect,
  clearReq,
  gameStatusReqExpect
} from '../requestHelpers';
import { createBasicGame, expectSuccess } from '../testHelpers';

let sessionId: string;
let quizId: number;
let gameId: number;

beforeEach(() => {
  clearReq();

  const basicGameRes = createBasicGame();

  sessionId = basicGameRes.sessionId;
  quizId = basicGameRes.quizId;
  gameId = basicGameRes.gameId;
});

describe('GET /v1/admin/quiz/{quizid}/game/{gameid}', () => {
  describe('Success', () => {
    test('200 - Status received', () => {
      const statusRes = gameStatusReqExpect(sessionId, quizId, gameId);
      expect(statusRes.body).toMatchObject({
        metadata: {
          name: 'Sample Quiz'
        }
      });
    });
  });
  describe('failure', () => {
    test('401 - UNAUTHORISED - session is empty', () => {
      gameStatusReqExpect(undefined, quizId, gameId, 401, 'UNAUTHORISED');
    });

    test('401 - UNAUTHORISED - sessionId is invalid', () => {
      const invalidSessionId = 'aaa';
      gameStatusReqExpect(invalidSessionId, quizId, gameId, 401, 'UNAUTHORISED');
    });

    test('403 - INVALID_QUIZ_ID - quiz doesnt exist', () => {
      const nonExistentQuizId = 2;
      gameStatusReqExpect(sessionId, nonExistentQuizId, gameId, 403, 'INVALID_QUIZ_ID');
    });

    test('400 - INVALID_GAME_ID - gameId doesnt exist at all', () => {
      const invalidGameId = 2;
      gameStatusReqExpect(sessionId, quizId, invalidGameId, 400, 'INVALID_GAME_ID');
    });
    test('400 - INVALID_GAME_ID - gameId exists but wrong quiz', () => {
      const quizRes2 = quizCreateReqExpect(sessionId, 'Quiz 2', 'Quiz 2 description', 200, 'OK');
      const quizId2 = expectSuccess(quizRes2.body).quizId;

      gameStatusReqExpect(sessionId, quizId2, gameId, 400, 'INVALID_GAME_ID');
    });
  });
});
