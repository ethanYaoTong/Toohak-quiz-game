import {
  clearReq,
  playerStatusReqExpect,
  playerJoinReqExpect
} from '../requestHelpers';
import { createBasicGame, expectSuccess } from '../testHelpers';

let playerId: number;
let gameId: number;

beforeEach(() => {
  clearReq();

  const createGameRes = createBasicGame();
  gameId = createGameRes.gameId;
  playerId = expectSuccess(playerJoinReqExpect(gameId, 'Justin Yang').body).playerId;
});

describe('playerGetStatus function', () => {
  test('Success', () => {
    const result = playerStatusReqExpect(playerId);
    expect(result.body).toStrictEqual({
      state: expect.any(String),
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
  });

  test('Invalid player ID', () => {
    playerStatusReqExpect(999999, 400, 'INVALID_PLAYER_ID');
  });
});
