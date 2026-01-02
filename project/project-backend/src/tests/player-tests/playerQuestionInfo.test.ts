import {
  clearReq,
  playerJoinReqExpect,
  playerQuestionInfoReqExpect,
} from '../requestHelpers';

import {
  createComplexGame,
  expectSuccess,
  goToQuestionCountdown,
  goToQuestionOpen,
  goToAnswerShow,
  goToFinalResults,
  goToEnd,
} from '../testHelpers';
import { AnswerOptionsInfo } from '../../types/externalTypes';

let sessionId: string;
let quizId: number;
let gameId: number;
let playerId: number;

beforeEach(() => {
  clearReq();

  // Create a game
  const complexGameRes = createComplexGame();
  sessionId = complexGameRes.sessionId;
  quizId = complexGameRes.quizId;
  gameId = complexGameRes.gameId;

  // Player joins
  const joinRes = playerJoinReqExpect(gameId, 'Player 1');
  playerId = expectSuccess(joinRes.body).playerId;
});

describe('Error Cases', () => {
  describe('400', () => {
    test('playerId does not exist', () => {
      playerQuestionInfoReqExpect(playerId + 1, 1, 400, 'INVALID_PLAYER_ID');
    });

    test('Question position is not valid for game (<1)', () => {
      goToQuestionOpen(sessionId, quizId, gameId);
      playerQuestionInfoReqExpect(playerId, 0, 400, 'INVALID_POSITION');
    });

    test('Question position is not valid for game (>numQuestions)', () => {
      goToQuestionOpen(sessionId, quizId, gameId);
      playerQuestionInfoReqExpect(playerId, 4, 400, 'INVALID_POSITION');
    });

    test('Game is not currently on this position', () => {
      goToAnswerShow(sessionId, quizId, gameId);
      goToQuestionOpen(sessionId, quizId, gameId);

      playerQuestionInfoReqExpect(playerId, 1, 400, 'INVALID_POSITION');
    });

    describe('Incompatible game states', () => {
      test('Game is in LOBBY', () => {
        playerQuestionInfoReqExpect(playerId, 0, 400, 'INCOMPATIBLE_GAME_STATE');
      });

      test('Game is in QUESTION_COUNTDOWN', () => {
        goToQuestionCountdown(sessionId, quizId, gameId);
        playerQuestionInfoReqExpect(playerId, 1, 400, 'INCOMPATIBLE_GAME_STATE');
      });

      test('Game is in FINAL_RESULTS', () => {
        goToFinalResults(sessionId, quizId, gameId);
        playerQuestionInfoReqExpect(playerId, 0, 400, 'INCOMPATIBLE_GAME_STATE');
      });

      test('Game is in END', () => {
        goToEnd(sessionId, quizId, gameId);
        playerQuestionInfoReqExpect(playerId, 0, 400, 'INCOMPATIBLE_GAME_STATE');
      });
    });
  });
});

describe('Success cases', () => {
  test('Player gets correct question data when game is in QUESTION_OPEN', () => {
    goToQuestionOpen(sessionId, quizId, gameId);

    const res = playerQuestionInfoReqExpect(playerId, 1);
    const question = expectSuccess(res.body);

    expect(question).toStrictEqual({
      questionId: expect.any(Number),
      question: 'Who is the Monarch of England?',
      timeLimit: 1,
      thumbnailUrl: 'http://example.com/image.jpg',
      points: 5,
      answerOptions: expect.any(Array),
    });

    question.answerOptions.forEach((opt: AnswerOptionsInfo) => {
      expect(opt.answerId).toStrictEqual(expect.any(Number));
      expect(opt.answer).toStrictEqual(expect.any(String));
      expect(opt.colour).toStrictEqual(expect.any(String));
    });
  });
});
