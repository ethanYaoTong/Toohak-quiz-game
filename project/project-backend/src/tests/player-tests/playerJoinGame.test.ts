import { clearReq, playerJoinReqExpect } from '../requestHelpers';
import { createBasicGame } from '../testHelpers';

let gameId: number;

beforeEach(() => {
  clearReq();
  const createGameRes = createBasicGame();
  gameId = createGameRes.gameId;
});

describe('playerJoinGame function', () => {
  test('successfully join a game until autostartnum is reached', () => {
    const res = playerJoinReqExpect(gameId, 'Justin Yang');
    expect(res.body).toStrictEqual({ playerId: expect.any(Number) });
    expect(res.body).toStrictEqual({ playerId: expect.any(Number) });

    playerJoinReqExpect(gameId, 'Kaiyu');
    playerJoinReqExpect(gameId, 'Daniel');

    // Game should start automatically after 3 players join
    // If another player joins, an error should be thrown
    playerJoinReqExpect(gameId, 'Melissa', 400, 'INCOMPATIBLE_GAME_STATE');
  });

  test('successfully joins game with empty string input', () => {
    const res = playerJoinReqExpect(gameId, '');
    expect(res.body).toStrictEqual({ playerId: expect.any(Number) });
  });

  describe('Testing error messages', () => {
    test('invalid player name with invalid characters', () => {
      playerJoinReqExpect(gameId, '$$&&', 400, 'INVALID_PLAYER_NAME');
    });

    test('name of user entered is not unique', () => {
      // First player joins game
      playerJoinReqExpect(gameId, 'Valid Name');
      // Second player attempts to join game with same name
      playerJoinReqExpect(gameId, 'Valid Name', 400, 'INVALID_PLAYER_NAME');
    });

    test('gameId does not refer to a valid game', () => {
      playerJoinReqExpect(999999, 'Valid Name', 400, 'INVALID_GAME_ID');
    });
  });
});
