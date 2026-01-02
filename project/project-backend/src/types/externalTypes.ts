import { GameState, Question, Player } from './internalTypes';

export interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface QuizDetails {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  timeLimit: number;
  thumbnailUrl: string;
}

export interface GameDetails {
  state: GameState;
  atQuestion: number;
  players: string[];
  metadata: QuizDetails;
}

export interface QuestionInput {
  questionBody: {
    question: string;
    timeLimit: number;
    points: number;
    answerOptions: {
      answer: string;
      correct: boolean;
      colour?: string;
    }[];
    thumbnailUrl: string;
  };
}

export interface PlayerQuestionInfo {
  questionId: number;
  question: string;
  timeLimit: number;
  thumbnailUrl: string;
  points: number;
  answerOptions: AnswerOptionsInfo[];
}

export interface AnswerOptionsInfo {
  answerId: number;
  answer: string;
  colour: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export type EmptyObject = Record<string, never>;

export type QuizListResponse = {
  quizzes: { quizId: number; name: string }[];
};

export interface PlayerStatus {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

export interface GameList {
  activeGames: number[];
  inactiveGames: number[];
}

export interface GameResult {
  usersRankedByScore: GameScore[];
  questionResults: QuestionResult[];
}

export interface GameScore {
  playerName: string;
  score: number;
}

export interface QuestionResult {
  questionId: number;
  playersCorrect: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface PlayerAnswerResult {
  player: Player; ans: Player['answer'][number];
}
