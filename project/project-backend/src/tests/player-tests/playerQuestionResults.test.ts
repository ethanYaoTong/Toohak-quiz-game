import {
  clearReq,
  playerJoinReqExpect,
  playerQuestionAnswerReqExpect,
  playerQuestionResultsReqExpect
} from '../requestHelpers';
import { QuestionResult } from '../../types/externalTypes';
import {
  createBasicGame,
  expectSuccess,
  goToQuestionOpen,
  goToAnswerShow,
  runActions,
} from '../testHelpers';

beforeEach(() => {
  clearReq();
});

describe('GET /v1/player/:playerid/question/:questionposition/results', () => {
  test('successfully returns results for a question', () => {
    const { sessionId, quizId, gameId, questionId } = createBasicGame();
    const playerAlice = expectSuccess(playerJoinReqExpect(gameId, 'Alice').body).playerId;
    const playerBob = expectSuccess(playerJoinReqExpect(gameId, 'Bob').body).playerId;

    goToQuestionOpen(sessionId, quizId, gameId);

    playerQuestionAnswerReqExpect(playerAlice, 1, [1]); // correct
    playerQuestionAnswerReqExpect(playerBob, 1, [2]); // incorrect

    runActions(sessionId, quizId, gameId, ['GO_TO_ANSWER']);

    const res = playerQuestionResultsReqExpect(playerAlice, 1);
    const body = res.body as QuestionResult;

    expect(body.questionId).toStrictEqual(questionId);
    expect(body.playersCorrect).toStrictEqual(['Alice']);
    expect(body.percentCorrect).toStrictEqual(50);
    expect(typeof body.averageAnswerTime).toStrictEqual('number');
  });

  test('returns averageAnswerTime of 0 when no players answer', () => {
    const { sessionId, quizId, gameId, questionId } = createBasicGame();
    const playerAlice = expectSuccess(playerJoinReqExpect(gameId, 'Alice').body).playerId;
    expectSuccess(playerJoinReqExpect(gameId, 'Bob').body);

    goToAnswerShow(sessionId, quizId, gameId);

    const res = playerQuestionResultsReqExpect(playerAlice, 1);
    const body = res.body as QuestionResult;

    expect(body.questionId).toStrictEqual(questionId);
    expect(body.playersCorrect).toStrictEqual([]);
    expect(body.percentCorrect).toStrictEqual(0);
    expect(body.averageAnswerTime).toStrictEqual(0);
  });

  test('400 INVALID_PLAYER_ID when player does not exist', () => {
    playerQuestionResultsReqExpect(9999, 1, 400, 'INVALID_PLAYER_ID');
  });

  test('400 INVALID_POSITION when question position invalid for game', () => {
    const { sessionId, quizId, gameId } = createBasicGame();
    const playerAlice = expectSuccess(playerJoinReqExpect(gameId, 'Alice').body).playerId;

    goToQuestionOpen(sessionId, quizId, gameId);
    playerQuestionAnswerReqExpect(playerAlice, 1, [1]);
    runActions(sessionId, quizId, gameId, ['GO_TO_ANSWER']);

    playerQuestionResultsReqExpect(playerAlice, 2, 400, 'INVALID_POSITION');
  });

  test('400 INCOMPATIBLE_GAME_STATE when game not in ANSWER_SHOW', () => {
    const { sessionId, quizId, gameId } = createBasicGame();
    const playerAlice = expectSuccess(playerJoinReqExpect(gameId, 'Alice').body).playerId;

    goToQuestionOpen(sessionId, quizId, gameId);

    playerQuestionResultsReqExpect(
      playerAlice,
      1,
      400,
      'INCOMPATIBLE_GAME_STATE'
    );
  });
});
