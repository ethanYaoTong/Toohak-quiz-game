import { QuizDetails } from './externalTypes';

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPasswords: string[];
}

export interface Quiz {
  quizId: number;
  name: string;
  ownerId: number;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  questions: Question[];
  thumbnailUrl: string;
  timeLimit: number;
  nextQuestionId: number;
}

export interface Question {
  questionId: number;
  question: string;
  timeLimit: number;
  thumbnailUrl: string;
  points: number;
  answerOptions: Answer[];
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface Player {
  playerId: number;
  gameId: number;
  playerName: string;
  answer: PlayerAnswers[];
  score: number;
}

export interface PlayerAnswers {
  questionPosition: number;
  answerIds: number[];
  timeAnswered: number;
}

export type GameState = 'LOBBY'
  | 'QUESTION_COUNTDOWN'
  | 'QUESTION_OPEN'
  | 'QUESTION_CLOSE'
  | 'ANSWER_SHOW'
  | 'FINAL_RESULTS'
  | 'END';

export type GameAction = 'NEXT_QUESTION'
  | 'SKIP_COUNTDOWN'
  | 'GO_TO_ANSWER'
  | 'GO_TO_FINAL_RESULTS'
  | 'END';

export interface Game {
  gameId: number;
  state: GameState;
  autoStartNum: number;
  atQuestion: number;
  questionOpenTimes: number[];
  players: string[];
  metadata: QuizDetails;
}

export interface Session {
  sessionId: string;
  userId: number;
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  sessions: Session[];
  nextUserId: number;
  nextQuizId: number;
  games: Game[];
  players: Player[];
  nextGameId: number;
  nextPlayerId: number;
}
