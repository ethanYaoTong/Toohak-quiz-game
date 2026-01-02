import {
  clearReq,
  registerReqExpect,
  gameResultsReqExpect,
  playerJoinReqExpect,
  playerQuestionAnswerReqExpect,
} from '../requestHelpers';
import {
  createBasicGame,
  expectSuccess,
  goToQuestionOpen,
  runActions,
} from '../testHelpers';

let ownerSessionId: string;
let baseQuizId: number;
let baseGameId: number;
let baseQuestionId: number;

beforeEach(() => {
  clearReq();
  const basicGame = createBasicGame();
  ownerSessionId = basicGame.sessionId;
  baseQuizId = basicGame.quizId;
  baseGameId = basicGame.gameId;
  baseQuestionId = basicGame.questionId;
});

describe('GET /v1/admin/quiz/:quizid/game/:gameid/results', () => {
  test('Successfully retrieves final results of a completed game', () => {
    const p1 = playerJoinReqExpect(baseGameId, 'Alice');
    const p2 = playerJoinReqExpect(baseGameId, 'Bob');

    const pid1 = expectSuccess(p1.body).playerId;
    const pid2 = expectSuccess(p2.body).playerId;

    goToQuestionOpen(ownerSessionId, baseQuizId, baseGameId);

    playerQuestionAnswerReqExpect(pid1, 1, [1]); // correct
    playerQuestionAnswerReqExpect(pid2, 1, [2]); // incorrect

    runActions(ownerSessionId, baseQuizId, baseGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const res = gameResultsReqExpect(ownerSessionId, baseQuizId, baseGameId);

    expect(res.statusCode).toStrictEqual(200);

    const results = expectSuccess(res.body);

    expect(results.usersRankedByScore).toStrictEqual([

      { playerName: 'Alice', score: 5 },
      { playerName: 'Bob', score: 0 },
    ]);

    expect(results.questionResults.length).toStrictEqual(1);

    expect(results.questionResults[0]).toMatchObject({
      questionId: baseQuestionId,
      playersCorrect: ['Alice'],
      percentCorrect: 50,
    });
    expect(typeof results.questionResults[0].averageAnswerTime).toStrictEqual('number');
  });

  test('Testing results with partial answers correct', () => {
    const p1 = playerJoinReqExpect(baseGameId, 'Alice');

    goToQuestionOpen(ownerSessionId, baseQuizId, baseGameId);
    playerQuestionAnswerReqExpect(expectSuccess(p1.body).playerId, 1, [1, 2]); // partially correct
    runActions(ownerSessionId, baseQuizId, baseGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const res = gameResultsReqExpect(ownerSessionId, baseQuizId, baseGameId);
    const results = expectSuccess(res.body);

    expect(results.usersRankedByScore).toStrictEqual([
      { playerName: 'Alice', score: 0 },
    ]);
    expect(results.questionResults[0]).toMatchObject({
      questionId: baseQuestionId,
      playersCorrect: [],
      percentCorrect: 0,
    });
  });

  test('Testing results if no players joined the game', () => {
    goToQuestionOpen(ownerSessionId, baseQuizId, baseGameId);

    runActions(ownerSessionId, baseQuizId, baseGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);
    const res = gameResultsReqExpect(ownerSessionId, baseQuizId, baseGameId);

    const results = expectSuccess(res.body);

    expect(results.usersRankedByScore).toStrictEqual([]);

    expect(results.questionResults.length).toStrictEqual(1);

    expect(results.questionResults[0]).toMatchObject({
      questionId: baseQuestionId,
      playersCorrect: [],
      percentCorrect: 0,
      averageAnswerTime: 0,
    });
  });

  test('Testing results if no questions are answered', () => {
    playerJoinReqExpect(baseGameId, 'Alice');
    playerJoinReqExpect(baseGameId, 'Bob');

    goToQuestionOpen(ownerSessionId, baseQuizId, baseGameId);

    runActions(ownerSessionId, baseQuizId, baseGameId, ['GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS']);

    const res = gameResultsReqExpect(ownerSessionId, baseQuizId, baseGameId);

    expect(res.statusCode).toStrictEqual(200);

    const results = expectSuccess(res.body);

    expect(results.usersRankedByScore).toStrictEqual([
      { playerName: 'Alice', score: 0 },
      { playerName: 'Bob', score: 0 },
    ]);

    expect(results.questionResults.length).toStrictEqual(1);

    expect(results.questionResults[0]).toMatchObject({
      questionId: baseQuestionId,
      playersCorrect: [],
      percentCorrect: 0,
      averageAnswerTime: 0,
    });
  });

  test('401 UNAUTHORISED - missing session', () => {
    gameResultsReqExpect(undefined, 1, 1, 401, 'UNAUTHORISED');
  });

  test('401 UNAUTHORISED - invalid session', () => {
    gameResultsReqExpect('invalid-session', 1, 1, 401, 'UNAUTHORISED');
  });

  test('403 INVALID_QUIZ_ID - user does not own quiz', () => {
    const intruder = registerReqExpect('intruder@example.com', 'Password123', 'Charlie', 'Davis');
    const intruderSession = expectSuccess(intruder.body).session;

    gameResultsReqExpect(
      intruderSession,
      baseQuizId,
      baseGameId,
      403,
      'INVALID_QUIZ_ID'
    );
  });

  test('403 INVALID_QUIZ_ID - quiz does not exist', () => {
    gameResultsReqExpect(
      ownerSessionId,
      9999,
      baseGameId,
      403,
      'INVALID_QUIZ_ID'
    );
  });

  test('400 INVALID_GAME_ID - game does not exist', () => {
    gameResultsReqExpect(
      ownerSessionId,
      baseQuizId,
      9999,
      400,
      'INVALID_GAME_ID'
    );
  });

  test('400 INCOMPATIBLE_GAME_STATE - game not in FINAL_RESULTS', () => {
    // CALL BEFORE FINAL_RESULTS
    gameResultsReqExpect(
      ownerSessionId,
      baseQuizId,
      baseGameId,
      400,
      'INCOMPATIBLE_GAME_STATE'
    );
  });
});
