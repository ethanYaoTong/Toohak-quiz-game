import {
  clearReq,
  playerQuestionAnswerReqExpect,
  playerGameResultReqExpect,
  playerJoinReqExpect
} from '../requestHelpers';

import {
  createBasicGame,
  expectSuccess,
  goToQuestionOpen,
  goToEnd,
  runActions
} from '../testHelpers';

let sessionId: string;
let quizId: number;
let gameId: number;
let playerId: number;

beforeEach(() => {
  clearReq();
  const gameRes = createBasicGame();
  sessionId = gameRes.sessionId;
  quizId = gameRes.quizId;
  gameId = gameRes.gameId;

  // Player joins
  const playerRes = playerJoinReqExpect(gameId, 'Player 1');
  playerId = expectSuccess(playerRes.body).playerId;

  // First Question
  goToQuestionOpen(sessionId, quizId, gameId);
});

describe('PUT /v1/player/{playerid}/question/{questionposition}/answer tests', () => {
  test('200 - SUCCESS - valid answer submission', () => {
    const answerRes = playerQuestionAnswerReqExpect(playerId, 1, [1]);
    expect(answerRes.body).toStrictEqual({});

    runActions(sessionId, quizId, gameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const gameRes = playerGameResultReqExpect(playerId);
    expect(expectSuccess(gameRes.body).questionResults[0].playersCorrect).toStrictEqual(['Player 1']);
  });

  test('200 - SUCCESS - answer submitted then resubmitted', () => {
    // Incorrect answer
    playerQuestionAnswerReqExpect(playerId, 1, [2]);

    // Resubmission of correct answer
    const answerRes2 = playerQuestionAnswerReqExpect(playerId, 1, [1]);
    expect(answerRes2.body).toStrictEqual({});

    runActions(sessionId, quizId, gameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const gameRes = playerGameResultReqExpect(playerId);
    expect(expectSuccess(gameRes.body).questionResults[0].playersCorrect).toStrictEqual(['Player 1']);
  });

  describe('INVALID_PLAYER_ID', () => {
    test('400 - player ID does not exist', () => {
      const nonexistentPlayerId = 134;
      playerQuestionAnswerReqExpect(nonexistentPlayerId, 1, [1], 400, 'INVALID_PLAYER_ID');
    });
  });

  describe('INVALID_POSITION', () => {
    test('400 - question position is not valid for the game', () => {
      playerQuestionAnswerReqExpect(playerId, 123123, [1], 400, 'INVALID_POSITION');
    });

    test('400 - game is not currently on this question', () => {
      playerQuestionAnswerReqExpect(playerId, 2, [1], 400, 'INVALID_POSITION');
    });
  });

  describe('INCOMPATIBLE_GAME_STATE', () => {
    test('400 - game is not in QUESTION_OPEN state', () => {
      goToEnd(sessionId, quizId, gameId);

      playerQuestionAnswerReqExpect(playerId, 1, [1], 400, 'INCOMPATIBLE_GAME_STATE');
    });
  });

  describe('INVALID_ANSWER_IDS', () => {
    test('400 - answer IDs are not valid for this question', () => {
      playerQuestionAnswerReqExpect(playerId, 1, [123], 400, 'INVALID_ANSWER_IDS');
    });

    test('400 - duplicate answer IDs provided', () => {
      playerQuestionAnswerReqExpect(playerId, 1, [1, 1], 400, 'INVALID_ANSWER_IDS');
    });

    test('400 - less than 1 answer ID submitted', () => {
      playerQuestionAnswerReqExpect(playerId, 1, [], 400, 'INVALID_ANSWER_IDS');
    });
  });
});
