import slync from 'slync';
import {
  clearReq,
  gameStateUpdateReqExpect,
  gameStatusReqExpect,
  quizCreateReqExpect,
} from '../requestHelpers';

import {
  createBasicGame,
  createComplexGame,
  expectSuccess,
  goToQuestionCountdown,
  goToQuestionOpen,
  goToQuestionCloseViaTimer,
  goToAnswerShow,
  goToFinalResults,
  goToEnd,
  runActions,
} from '../testHelpers';

let sessionId: string;
let quizId: number;
let gameId: number;

beforeEach(() => {
  clearReq();

  const complexGameRes = createComplexGame();
  sessionId = complexGameRes.sessionId;
  quizId = complexGameRes.quizId;
  gameId = complexGameRes.gameId;
});

describe('Successful game state updates', () => {
  describe('Basic game actions', () => {
    describe('Lobby actions', () => {
      test('END', () => {
        runActions(sessionId, quizId, gameId, ['END']);
      });
    });

    describe('Question Countdown actions', () => {
      test('END', () => {
        goToQuestionCountdown(sessionId, quizId, gameId);
        runActions(sessionId, quizId, gameId, ['END']);
      });
    });

    describe('Question Open actions', () => {
      test('END', () => {
        goToQuestionOpen(sessionId, quizId, gameId);
        runActions(sessionId, quizId, gameId, ['END']);
      });
    });

    describe('Question Close actions', () => {
      beforeEach(() => {
        goToQuestionCloseViaTimer(sessionId, quizId, gameId);
      });

      test.each([
        'GO_TO_ANSWER',
        'GO_TO_FINAL_RESULTS',
        'NEXT_QUESTION',
        'END',
      ])('allows action %s', (action) => {
        runActions(sessionId, quizId, gameId, [action]);
      });
    });

    describe('Answer Show actions', () => {
      beforeEach(() => {
        goToAnswerShow(sessionId, quizId, gameId);
      });

      test.each([
        'NEXT_QUESTION',
        'END',
      ])('allows action %s', (action) => {
        runActions(sessionId, quizId, gameId, [action]);
      });
    });

    describe('Final Results actions', () => {
      test('END', () => {
        goToFinalResults(sessionId, quizId, gameId);
        runActions(sessionId, quizId, gameId, ['END']);
      });
    });
  });

  test('Countdown timer successfully triggers state change', () => {
    goToQuestionCountdown(sessionId, quizId, gameId);

    const before = gameStatusReqExpect(sessionId, quizId, gameId);
    expect(expectSuccess(before.body).state).toStrictEqual('QUESTION_COUNTDOWN');

    slync(3000); // countdown timer is 3 seconds

    const after = gameStatusReqExpect(sessionId, quizId, gameId);
    expect(expectSuccess(after.body).state).toStrictEqual('QUESTION_OPEN');
  });

  test('Question timer successfully triggers state change', () => {
    goToQuestionOpen(sessionId, quizId, gameId);

    const before = gameStatusReqExpect(sessionId, quizId, gameId);
    expect(expectSuccess(before.body).state).toStrictEqual('QUESTION_OPEN');

    slync(1000); // question timer on first question in quiz is 1 second

    const after = gameStatusReqExpect(sessionId, quizId, gameId);
    expect(expectSuccess(after.body).state).toStrictEqual('QUESTION_CLOSE');
  });
});

describe('Error checking', () => {
  describe('401', () => {
    test('sessionId is invalid', () => {
      gameStateUpdateReqExpect(
        'invalidSessionId',
        quizId, gameId,
        'NEXT_QUESTION',
        401,
        'UNAUTHORISED');
    });

    test('sessionId is missing', () => {
      gameStateUpdateReqExpect(
        undefined,
        quizId,
        gameId,
        'NEXT_QUESTION',
        401,
        'UNAUTHORISED');
    });
  });

  describe('403 (quiz ownership)', () => {
    test('Quiz does not exist', () => {
      gameStateUpdateReqExpect(
        sessionId,
        999999,
        gameId,
        'NEXT_QUESTION',
        403,
        'INVALID_QUIZ_ID'
      );
    });
  });

  describe('400', () => {
    test('gameId does not belong to this quiz', () => {
      const otherQuizRes = quizCreateReqExpect(
        sessionId,
        'Other Quiz',
        'Another quiz description.'
      );
      const otherQuizId = expectSuccess(otherQuizRes.body).quizId;

      gameStateUpdateReqExpect(
        sessionId,
        otherQuizId,
        gameId,
        'NEXT_QUESTION',
        400,
        'INVALID_GAME_ID'
      );
    });

    test('Action is not a valid GameAction enum', () => {
      gameStateUpdateReqExpect(
        sessionId,
        quizId,
        gameId,
        'MAKE_ME_WIN',
        400,
        'INVALID_ACTION'
      );
    });

    describe('Incompatible game actions', () => {
      const cases = [
        {
          testLabel: 'Lobby: SKIP_COUNTDOWN is invalid',
          goToState: null,
          invalidAction: 'SKIP_COUNTDOWN',
        },
        {
          testLabel: 'Question Countdown: NEXT_QUESTION is invalid',
          goToState: goToQuestionCountdown,
          invalidAction: 'NEXT_QUESTION',
        },
        {
          testLabel: 'Question Open: SKIP_COUNTDOWN is invalid',
          goToState: goToQuestionOpen,
          invalidAction: 'SKIP_COUNTDOWN',
        },
        {
          testLabel: 'Question Close: SKIP_COUNTDOWN is invalid',
          goToState: goToQuestionCloseViaTimer,
          invalidAction: 'SKIP_COUNTDOWN',
        },
        {
          testLabel: 'Answer Show: SKIP_COUNTDOWN is invalid',
          goToState: goToAnswerShow,
          invalidAction: 'SKIP_COUNTDOWN',
        },
        {
          testLabel: 'Final Results: SKIP_COUNTDOWN is invalid',
          goToState: goToFinalResults,
          invalidAction: 'SKIP_COUNTDOWN',
        },
        {
          testLabel: 'End: SKIP_COUNTDOWN is invalid',
          goToState: goToEnd,
          invalidAction: 'SKIP_COUNTDOWN',
        },
      ];

      test.each(cases)('%s', ({ goToState, invalidAction }) => {
        if (goToState) {
          goToState(sessionId, quizId, gameId);
        }

        gameStateUpdateReqExpect(
          sessionId,
          quizId,
          gameId,
          invalidAction,
          400,
          'INCOMPATIBLE_GAME_STATE'
        );
      });
    });

    test('Use of NEXT_QUESTION on last question', () => {
      clearReq();
      const basicGame = createBasicGame();
      sessionId = basicGame.sessionId;
      quizId = basicGame.quizId;
      gameId = basicGame.gameId;

      goToAnswerShow(sessionId, quizId, gameId);

      gameStateUpdateReqExpect(
        sessionId,
        quizId,
        gameId,
        'NEXT_QUESTION',
        400,
        'INCOMPATIBLE_GAME_STATE'
      );
    });
  });
});
