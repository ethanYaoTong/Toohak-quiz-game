import {
  clearReq,
  gameStartReqExpect,
  playerJoinReqExpect,
  playerGameResultReqExpect,
  playerQuestionAnswerReqExpect
} from '../requestHelpers';
import {
  createBasicGame,
  expectSuccess,
  goToQuestionOpen,
  runActions,
} from '../testHelpers';
import slync from 'slync';

let sessionId: string;
let quizId: number;
let gameId: number;
let playerIdDaniel: number;
let playerIdEthan: number;

beforeEach(() => {
  clearReq();

  const basicGame = createBasicGame();
  sessionId = basicGame.sessionId;
  quizId = basicGame.quizId;
  gameId = basicGame.gameId;

  // Join baseline players while the game is still in LOBBY state
  const joinDaniel = playerJoinReqExpect(gameId, 'Daniel');
  playerIdDaniel = expectSuccess(joinDaniel.body).playerId;

  const joinEthan = playerJoinReqExpect(gameId, 'Ethan');
  playerIdEthan = expectSuccess(joinEthan.body).playerId;

  playerJoinReqExpect(gameId, 'Melissa');

  // autoStartNum = 3 and three players have joined
  // so the game has already auto-started to QUESTION_COUNTDOWN.
  // We now state change to FINAL_RESULTS
  runActions(sessionId, quizId, gameId, ['SKIP_COUNTDOWN', 'GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);
});

describe('adminQuizGameResults /v1/player/{playerid}/results', () => {
  test('all players have zero score and result includes all joined players', () => {
    // Use any valid playerId; results should include all players in the game
    const res = playerGameResultReqExpect(playerIdDaniel);
    const body = expectSuccess(res.body);

    const names = body.usersRankedByScore.map(u => u.playerName);
    const scores = body.usersRankedByScore.map(u => u.score);

    // With no answers submitted, all scores should be 0
    const sortedNames = [...names].sort();
    expect(sortedNames).toStrictEqual(['Daniel', 'Ethan', 'Melissa']);
    expect(scores).toStrictEqual([0, 0, 0]);

    // Question-level stats should reflect no answers
    expect(body.questionResults).toHaveLength(1);
    const q0 = body.questionResults[0];
    expect(q0.playersCorrect).toStrictEqual([]);
    expect(q0.averageAnswerTime).toStrictEqual(0);
    expect(q0.percentCorrect).toStrictEqual(0);
  });

  test('results are identical regardless of which valid playerId is used in FINAL_RESULTS state', () => {
    const resDaniel = playerGameResultReqExpect(playerIdDaniel);
    const resEthan = playerGameResultReqExpect(playerIdEthan);

    const bodyDaniel = expectSuccess(resDaniel.body);
    const bodyEthan = expectSuccess(resEthan.body);

    expect(bodyEthan).toStrictEqual(bodyDaniel);
  });

  test('scores and question stats update when players submit answers', () => {
    clearReq();

    const basicGame = createBasicGame();
    const localSessionId = basicGame.sessionId;
    const localQuizId = basicGame.quizId;
    const localGameId = basicGame.gameId;

    // Two players join this game
    const joinDaniel = playerJoinReqExpect(localGameId, 'Daniel');
    const danielId = expectSuccess(joinDaniel.body).playerId;

    const joinEthan = playerJoinReqExpect(localGameId, 'Ethan');
    const ethanId = expectSuccess(joinEthan.body).playerId;

    // Move game from LOBBY -> QUESTION_COUNTDOWN -> QUESTION_OPEN
    goToQuestionOpen(localSessionId, localQuizId, localGameId);

    // In the basic game, the first answer option is correct (answerId = 1).
    // Daniel answers correctly, Ethan answers incorrectly.
    slync(500); // delay (ensures averageTimeAnswered doesn't round down to 0)
    playerQuestionAnswerReqExpect(danielId, 1, [1]);
    playerQuestionAnswerReqExpect(ethanId, 1, [2]);

    // Close question and go to FINAL_RESULTS
    runActions(localSessionId, localQuizId, localGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const res = playerGameResultReqExpect(danielId);
    const body = expectSuccess(res.body);

    // Ranking: Daniel should get full points (5) and Ethan should have 0
    // because the question in createBasicGame is worth 5 points and only
    // Daniel answered correctly.
    const users = body.usersRankedByScore;
    expect(users).toHaveLength(2);

    const daniel = users.find(u => u.playerName === 'Daniel');
    const ethan = users.find(u => u.playerName === 'Ethan');
    expect(daniel).toBeDefined();
    expect(ethan).toBeDefined();

    expect(daniel!.score).toStrictEqual(5);
    expect(ethan!.score).toStrictEqual(0);

    // Question-level stats: only Daniel is correct
    expect(body.questionResults).toHaveLength(1);
    const q0 = body.questionResults[0];
    expect(q0.playersCorrect).toStrictEqual(['Daniel']);
    expect(q0.percentCorrect).toStrictEqual(50); // 1 out of 2 players answered correctly
    expect(typeof q0.averageAnswerTime).toStrictEqual('number');
    expect(q0.averageAnswerTime).toBeGreaterThan(0);
  });

  test('two correct players split points according to rank (5 and 3)', () => {
    clearReq();

    const basicGame = createBasicGame();
    const localSessionId = basicGame.sessionId;
    const localQuizId = basicGame.quizId;
    const localGameId = basicGame.gameId;

    // Two players join this game
    const joinFast = playerJoinReqExpect(localGameId, 'Fast');
    const fastId = expectSuccess(joinFast.body).playerId;
    slync(1000);

    const joinSlow = playerJoinReqExpect(localGameId, 'Slow');
    const slowId = expectSuccess(joinSlow.body).playerId;

    goToQuestionOpen(localSessionId, localQuizId, localGameId);

    // Both players answer correctly, Fast answers first and Slow answers
    // second with the question being worth 5 points. Thus we yield:
    // Fast: round(5 / 1) = 5 points
    // Slow: round(5 / 2) = 3 points
    playerQuestionAnswerReqExpect(fastId, 1, [1]);
    playerQuestionAnswerReqExpect(slowId, 1, [1]);

    // Close question and go to FINAL_RESULTS
    runActions(localSessionId, localQuizId, localGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const res = playerGameResultReqExpect(fastId);
    const body = expectSuccess(res.body);

    const users = body.usersRankedByScore;

    expect(users).toStrictEqual([{ playerName: 'Fast', score: 5 }, { playerName: 'Slow', score: 3 }]);
  });

  describe('400 error cases', () => {
    test('INVALID_PLAYER_ID when player does not exist', () => {
      playerGameResultReqExpect(999999, 400, 'INVALID_PLAYER_ID');
    });

    test('INCOMPATIBLE_GAME_STATE when game is not in FINAL_RESULTS state', () => {
      const newGame = gameStartReqExpect(sessionId, quizId, 1);
      const body = expectSuccess(newGame.body);
      const joinRes = playerJoinReqExpect(body.gameId, 'Daniel');
      const newPlayerId = expectSuccess(joinRes.body).playerId;

      playerGameResultReqExpect(newPlayerId, 400, 'INCOMPATIBLE_GAME_STATE');
    });
  });
});
