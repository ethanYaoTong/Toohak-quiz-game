import {
  clearReq,
  registerReqExpect,
  gameListReqExpect,
  gameStartReqExpect,
} from '../requestHelpers';

import {
  createBasicGame,
  expectSuccess,
  goToEnd,
} from '../testHelpers';

let sessionId: string;
let quizId: number;

beforeEach(() => {
  clearReq();

  const createGameRes = createBasicGame();
  sessionId = createGameRes.sessionId;
  quizId = createGameRes.quizId;
});

describe('adminQuizGames (GET /v1/admin/quiz/:quizid/games)', () => {
  describe('Success Case', () => {
    test('returns active and inactive gameIds sorted in ascending order', () => {
      // We already have one active game from createBasicGame.
      const secondGameRes = gameStartReqExpect(sessionId, quizId, 1);
      const secondGameId = expectSuccess(secondGameRes.body).gameId;

      // Create a third game
      gameStartReqExpect(sessionId, quizId, 1);

      const fourthGameRes = gameStartReqExpect(sessionId, quizId, 1);
      const fourthGameId = expectSuccess(fourthGameRes.body).gameId;

      // End two of the games so they become inactive
      goToEnd(sessionId, quizId, secondGameId);
      goToEnd(sessionId, quizId, fourthGameId);

      const listRes = gameListReqExpect(sessionId, quizId);
      const body = expectSuccess(listRes.body);

      // expectedActive should contain the gameId of first and third game
      // expectedInactive should contain the gameId of second and fourth game
      const expectedActive = [1, 3];
      const expectedInactive = [2, 4];

      expect(body.activeGames).toStrictEqual(expectedActive);
      expect(body.inactiveGames).toStrictEqual(expectedInactive);
    });
  });

  describe('Error checking', () => {
    describe('401 UNAUTHORISED', () => {
      test('sessionId is invalid', () => {
        gameListReqExpect('invalidSessionId', quizId, 401, 'UNAUTHORISED');
      });

      test('sessionId is missing', () => {
        gameListReqExpect(undefined, quizId, 401, 'UNAUTHORISED');
      });
    });

    describe('403 INVALID_QUIZ_ID', () => {
      test('quiz does not exist', () => {
        gameListReqExpect(sessionId, 999999, 403, 'INVALID_QUIZ_ID');
      });

      test('user is not an owner of this quiz', () => {
        const regRes = registerReqExpect('kaiyuyukatsu@gmail.com', 'goodpassword123', 'Kaiyus', 'Katsu');
        const body = expectSuccess(regRes.body);
        gameListReqExpect(body.session, quizId, 403, 'INVALID_QUIZ_ID');
      });
    });
  });
});
