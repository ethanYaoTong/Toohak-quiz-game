import { downtimer, type TimerId } from 'downtimer';
import { saveData } from './dataStore';
import { Game } from './types/internalTypes';

const timers = downtimer();

const countdownTimers = new Map<number, TimerId>();
const questionTimers = new Map<number, TimerId>();

// ============================================================
// Countdown Timer (QUESTION_COUNTDOWN -> QUESTION_OPEN)
// ============================================================
/**
 * Helper function that schedules a countdown timer
 * @param { Game } game - The game.
 */
export function scheduleCountdownTimer(game: Game) {
  cancelCountdownTimer(game);

  const timerId = timers.schedule(() => {
    autoOpenQuestion(game);
  }, 3000);

  countdownTimers.set(game.gameId, timerId);
}

/**
 * Helper function that cancels a countdown timer
 * @param { Game } game - The game.
 */
export function cancelCountdownTimer(game: Game) {
  const timerId = countdownTimers.get(game.gameId);

  if (timerId !== undefined) {
    timers.clear(timerId);
    countdownTimers.delete(game.gameId);
  }
}

// ============================================================
// Question Timer (QUESTION_OPEN -> QUESTION_CLOSE)
// ============================================================
/**
 * Helper function that schedules a question timer
 * @param { Game } game - The game.
 */
export function scheduleQuestionTimer(game: Game) {
  cancelQuestionTimer(game);

  const question = game.metadata.questions[game.atQuestion - 1];
  const durationMs = question.timeLimit * 1000;

  const timerId = timers.schedule(() => {
    autoCloseQuestion(game);
  }, durationMs);

  questionTimers.set(game.gameId, timerId);
}

/**
 * Helper function that cancels a question timer
 * @param { Game } game - The game.
 */
export function cancelQuestionTimer(game: Game) {
  const timerId = questionTimers.get(game.gameId);

  if (timerId !== undefined) {
    timers.clear(timerId);
    questionTimers.delete(game.gameId);
  }
}

// ============================================================
// Automatic state changes triggered by timers
// ============================================================
/**
 * Helper function that auto state changes if QUESTION_OPEN once
 * countdown timer runs out
 * @param { Game } game - The game.
 */
export function autoOpenQuestion(game: Game) {
  cancelCountdownTimer(game);

  game.state = 'QUESTION_OPEN';
  game.questionOpenTimes.push(Date.now());
  scheduleQuestionTimer(game);

  saveData();
}

/**
 * Helper function that auto state changes if QUESTION_CLOSE once
 * question timer runs out
 * @param { Game } game - The game.
 */
export function autoCloseQuestion(game: Game) {
  cancelQuestionTimer(game);
  game.state = 'QUESTION_CLOSE';

  saveData();
}
