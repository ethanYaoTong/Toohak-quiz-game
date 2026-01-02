import { getData, saveData } from './dataStore';
import { DataStore, Quiz } from './types/internalTypes';
import { EmptyObject, QuizDetails, QuestionInput, QuizListResponse } from './types/externalTypes';
import { BadRequestError } from './toohakError';
import { getUserFromSessionId, getQuizById } from './helpers';

// Quiz validation flags
const QUIZ_CREATE_FLAG = -1;
const QUIZ_UPDATE_FLAG = 1;

// Quiz name constraints
const MIN_QUIZ_NAME_LENGTH = 3;
const MAX_QUIZ_NAME_LENGTH = 30;

// Quiz description constraints
const MAX_DESCRIPTION_LENGTH = 100;

// Question text constraints
const MIN_QUESTION_LENGTH = 5;
const MAX_QUESTION_LENGTH = 50;

// Points constraints
const MIN_POINTS = 1;
const MAX_POINTS = 10;

// Answer options constraints
const MIN_ANSWER_OPTIONS = 2;
const MAX_ANSWER_OPTIONS = 6;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 30;

// Time limit constraints
const MIN_TIME_LIMIT = 0;
const MAX_TOTAL_TIME_LIMIT = 180; // 3 minutes in seconds

// Answer ID starting value
const ANSWER_ID_START = 1;

/**
 * Update the name of the relevant quiz.
 * @param { integer } userId - unique numerical identifier for each user
 * @param { integer } quizId - unique numerical identifier for each quiz
 * @param { string } name - name of quiz
 * @returns { EmptyObject } Returns empty object `{ }` on success
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - if the provided quiz name is invalid or already used
 */
export function adminQuizNameUpdate(
  sessionId: string | undefined,
  quizId: number,
  name: string
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const userId = validSession.userId;
  const quiz = getQuizById(quizId, userId);

  validQuizName(name, userId);

  quiz.name = name;
  saveData();
  return { };
}
/**
 * Helper function that checks if a quiz name is valid
 * @param { string } name - name of quiz
 * @param { number } userId - unique numerical identifier for each user
 * @throws { BadRequestError } - if invalid quiz name
 * @throws { BadRequestError } - if quiz name already used
 */
function validQuizName(name: string, userId: number) {
  const data: DataStore = getData();

  const nonValidCharacters = /[^a-zA-Z0-9 ]/.test(name);
  const nameLen = name.length;
  if (nonValidCharacters || nameLen < MIN_QUIZ_NAME_LENGTH || nameLen > MAX_QUIZ_NAME_LENGTH) {
    throw new BadRequestError('INVALID_QUIZ_NAME', 'Invalid quiz name');
  }

  const existingQuizName = data.quizzes.find(q => q.name === name && q.ownerId === userId);
  if (existingQuizName) {
    throw new BadRequestError('DUPLICATE_QUIZ_NAME', 'Quiz name is already used');
  }
}

/**
 * Retrieves all relevant information about a specific quiz owned by a given user.
 * @param { string } sessionId - The unique  identifier of the user's session.
 * @param { number } quizId - The unique numerical identifier of the quiz to retrieve.
 * @returns { QuizDetails } Returns the quiz details object if successful.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 */
export function adminQuizInfo(
  sessionId: string | undefined,
  quizId: number
): QuizDetails {
  const validSession = getUserFromSessionId(sessionId);

  const userId = validSession.userId;
  const quiz = getQuizById(quizId, userId);

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.questions.length,
    questions: quiz.questions,
    timeLimit: quiz.questions.reduce((prev: number, curr) => prev + curr.timeLimit, 0),
    thumbnailUrl: quiz.thumbnailUrl
  };
}
/**
 * Retrieves a list of all quizzes owned by the specified user.
 * @param { string | undefined } sessionId - The user's session token.
 * @returns { QuizListResponse }
 * Returns an object containing an array of the user's quizzes (each with a `quizId` and `name`),
 * @throws { UnauthorisedError } - if the session is empty or invalid
 */
export function adminQuizList(
  sessionId: string | undefined
): QuizListResponse {
  const data: DataStore = getData();
  const validSession = getUserFromSessionId(sessionId);

  const userId = validSession.userId;
  const quizzes = data.quizzes
    .filter(q => q.ownerId === userId)
    .map(q => ({ quizId: q.quizId, name: q.name }));

  return { quizzes };
}

/**
 * Creates a new quiz for the specified user using the provided name and description.
 * @param { string | undefined } sessionId - The unique session identifier.
 * @param { string } name - The name of the new quiz.
 * @param { string } description - A brief description of the quiz.
 * @throws { BadRequestError } - if description is more than 100 characters in length
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { BadRequestError } - if the quiz name is invalid or already used
 * @returns { { number } }
 * Returns an object containing the newly created quiz's `quizId` on success.
 */
export function adminQuizCreate(
  sessionId: string | undefined,
  name: string, description: string
): { quizId: number } {
  const data: DataStore = getData();

  const validSession = getUserFromSessionId(sessionId);

  validQuizName(name, validSession.userId);

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new BadRequestError('INVALID_DESCRIPTION', 'Description is more than 100 characters in length.');
  }

  const newQuiz: Quiz = {
    quizId: data.nextQuizId,
    name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description,
    ownerId: validSession.userId,
    thumbnailUrl: '',
    questions: [],
    timeLimit: 0,
    nextQuestionId: 0
  };

  data.nextQuizId++;
  data.quizzes.push(newQuiz);
  saveData();

  return { quizId: newQuiz.quizId };
}

/**
 * Permanently deletes a specific quiz owned by the specified user.
 * @param { string | undefined } sessionId - The unique session identifier.
 * @param { number } quizId - The unique numerical identifier of the quiz to be removed.
 * @returns { EmptyObject }
 * Returns an empty object `{ }` on successful deletion
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 */
export function adminQuizRemove(
  sessionId: string | undefined,
  quizId: number
): EmptyObject {
  const data: DataStore = getData();

  const user = getUserFromSessionId(sessionId);

  getQuizById(quizId, user.userId);

  const index = data.quizzes.findIndex(q => q.quizId === quizId);
  data.quizzes.splice(index, 1);
  saveData();

  return { };
}

/**
 * Permanently deletes a specific quiz owned by the specified user.
 * @param { string | undefined } sessionId - The unique session identifier.
 * @param { number } quizId - The unique numerical identifier of the quiz to be removed.
 * @throws { BadRequestError } - if quiz has an active game
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @returns { EmptyObject }
 * Returns an empty object `{ }` on successful deletion
 */
export function adminQuizRemoveV2(
  sessionId: string | undefined,
  quizId: number
): EmptyObject {
  const data: DataStore = getData();

  const user = getUserFromSessionId(sessionId);

  getQuizById(quizId, user.userId);

  if (hasActiveGames(quizId)) {
    throw new BadRequestError('ACTIVE_GAME_EXISTS', 'Cannot delete quiz with active games.');
  }

  const index = data.quizzes.findIndex(q => q.quizId === quizId);
  data.quizzes.splice(index, 1);
  saveData();

  return { };
}

/**
 * Checks if there are any active games for a quiz
 * @param { number } quizId - The unique identifier for the quiz.
 * @return { boolean } - returns true if active games exist, false otherwise
 */
export function hasActiveGames(quizId: number): boolean {
  const data: DataStore = getData();
  return data.games.some(game => game.metadata.quizId === quizId && game.state !== 'END');
}

/**
 * Updates the description of a specific quiz owned by the specified user.
 * @param { string | undefined } sessionId - The user's session token.
 * @param { number } quizId - The unique numerical identifier of the quiz to update.
 * @param { string } description - The new description to assign to the quiz.
 * @throws { BadRequestError } - if description is more than 100 characters in length
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @returns { EmptyObject }
 * Returns an empty object `{ }` on successful update.
 */
export function adminQuizDescriptionUpdate(
  sessionId: string | undefined,
  quizId: number,
  description: string
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const quiz = getQuizById(quizId, validSession.userId);

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new BadRequestError('INVALID_DESCRIPTION', 'Description is more than 100 characters in length.');
  }

  quiz.description = description;
  saveData();

  return { };
}

/**
 * Updates the thumbnail of a specific quiz owned by the specified user.
 * @param { number } quizId - The unique numerical identifier of the quiz to update.
 * @param { string | undefined } sessionId - The unique session identifier.
 * @param { string } thumbnailUrl - The thumbnail url.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - if the thumbnail URL fails validation
 * @returns { EmptyObject }
 * Returns an empty object `{ }` on successful update.
 */
export function adminQuizThumbnailUpdate(
  sessionId: string | undefined,
  quizId: number,
  thumbnailUrl: string
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const validQuiz = getQuizById(quizId, validSession.userId);

  validateThumbnailUrl(thumbnailUrl);

  validQuiz.thumbnailUrl = thumbnailUrl;
  validQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();

  return { };
}

/**
 * Helper function that checks if a thumbnail URL is valid
 * @param { string } thumbnailUrl - The thumbnail url.
 * @throws { BadRequestError } - if the thumbnailUrl does not begin with http:// or https://
 * @throws { BadRequestError } - if the thumbnailUrl does not end with one of the following filetypes: jpg, jpeg, or png
 * @returns { { string } } - returns thumbnailUrl if valid.
 */
function validateThumbnailUrl(
  thumbnailUrl: string
): { thumbnailUrl: string } {
  if (!/^https?:\/\//i.test(thumbnailUrl)) {
    throw new BadRequestError(
      'INVALID_THUMBNAIL',
      'The thumbnailUrl does not begin with "http://" or "https://".'
    );
  }

  if (!/\.(jpg|jpeg|png)$/i.test(thumbnailUrl)) {
    throw new BadRequestError(
      'INVALID_THUMBNAIL',
      'The thumbnailUrl does not end with one of the following filetypes: jpg, jpeg, or png.'
    );
  }

  return { thumbnailUrl: thumbnailUrl };
}

/**
 * Creates a new question within a specific quiz owned by the specified user.
 * @param { string | undefined } sessionId - The user's session token.
 * @param { number } quizId - The quiz ID to which the question is added.
 * @param { QuestionInput['questionBody'] } questionBody - The question data from the request.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - if the question body fails validation (invalid text, answers, or time limits)
 * @returns { { number } } } - returns questionId on success.
 */
export function adminQuizCreateQuestion(
  sessionId: string | undefined,
  quizId: number,
  questionBody: QuestionInput['questionBody']
): { questionId: number } {
  const validSession = getUserFromSessionId(sessionId);

  const quiz = getQuizById(quizId, validSession.userId);

  const { question, timeLimit, points, answerOptions, thumbnailUrl } = questionBody;
  validateNewQuestion(questionBody, quiz, 0, QUIZ_CREATE_FLAG);

  const newQuestionId = quiz.nextQuestionId++;

  const formattedAnswers = answerOptions.map((option, index) => ({
    answerId: index + ANSWER_ID_START,
    answer: option.answer,
    colour: randomEnumColour(),
    correct: option.correct,
  }));

  const newQuestion = {
    questionId: newQuestionId,
    question,
    timeLimit,
    points,
    answerOptions: formattedAnswers,
    thumbnailUrl,
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();

  return { questionId: newQuestionId };
}

const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'] as const;
type Colour = typeof COLOURS[number];

/**
 * Generates a random colour from the predefined COLOURS array.
 * @returns { Colour } - A randomly selected colour.
 */
function randomEnumColour(): Colour {
  return COLOURS[Math.floor(Math.random() * COLOURS.length)];
}

/**
 * Removes a question within a specific quiz owned by the specified user.
 * @param { number } quizId - The quiz ID to which the question is added.
 * @param { number } questionId - The question ID of the specific question
 * @param { string | undefined } sessionId - The user's session token.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - if question id does not refer to a valid question within this quiz
 * @throws { BadRequestError } - if game is not in END state
 * @returns { EmptyObject } Returns empty object `{ }` on success.
 */
export function adminQuizRemoveQuestionV2(
  quizId: number,
  questionId: number,
  sessionId: string | undefined
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const quiz = getQuizById(quizId, validSession.userId);

  const index = quiz.questions.findIndex(q => q.questionId === questionId);

  if (index === -1) {
    throw new BadRequestError('INVALID_QUESTION_ID', 'Question ID does not refer to a valid question within this quiz.');
  }

  if (hasActiveGames(quizId)) {
    throw new BadRequestError(
      'ACTIVE_GAME_EXISTS',
      'A game/s for this quiz is not in END state.'
    );
  }

  quiz.questions.splice(index, 1);
  saveData();

  return { };
}

/**
 * Removes a question within a specific quiz owned by the specified user.
 * @param { number } quizId - The quiz ID to which the question is added.
 * @param { number } questionId - The question ID of the specific question
 * @param { string | undefined } sessionId - The user's session token.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - Question ID does not refer to a valid question within this quiz
 * @returns { EmptyObject } Returns empty object `{ }` on success.
 */
export function adminQuizRemoveQuestion(
  quizId: number,
  questionId: number,
  sessionId: string | undefined
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const quiz = getQuizById(quizId, validSession.userId);

  const index = quiz.questions.findIndex(q => q.questionId === questionId);

  if (index === -1) {
    throw new BadRequestError('INVALID_QUESTION_ID', 'Question ID does not refer to a valid question within this quiz.');
  }

  quiz.questions.splice(index, 1);
  saveData();

  return { };
}

/**
 * Creates a new question within a specific quiz owned by the specified user.
 * @param { string | undefined } sessionId - The user's session token.
 * @param { number } quizId - The quiz ID to which the question is added.
 * @param { number } questionId
 * @param { QuestionInput['questionBody'] } questionBody - The question data from the request.
 * @throws { UnauthorisedError } - if the session is empty or invalid
 * @throws { ForbiddenError } - if the quiz does not exist or is not owned by the user
 * @throws { BadRequestError } - if Question Id does not refer to a valid question within this quiz
 * @throws { BadRequestError } - if the updated question content fails validation
 * @returns { EmptyObject } - Returns empty object `{ }` on success.
 */
export function adminQuizUpdateQuestion(
  sessionId: string | undefined,
  quizId: number,
  questionId: number,
  questionBody: QuestionInput['questionBody']
): EmptyObject {
  const validSession = getUserFromSessionId(sessionId);

  const userId = validSession.userId;
  const quiz = getQuizById(quizId, userId);

  const index = quiz.questions.findIndex(q => q.questionId === questionId);
  if (index === -1) {
    throw new BadRequestError('INVALID_QUESTION_ID', 'Question Id does not refer to a valid question within this quiz.');
  }

  validateNewQuestion(questionBody, quiz, index, QUIZ_UPDATE_FLAG);

  const { question, timeLimit, points, answerOptions, thumbnailUrl } = questionBody;
  const formattedAnswers = answerOptions.map((option, index) => ({
    answerId: index + ANSWER_ID_START,
    answer: option.answer,
    colour: randomEnumColour(),
    correct: option.correct,
  }));

  const newQuestion = {
    questionId: questionId,
    question,
    timeLimit,
    points,
    answerOptions: formattedAnswers,
    thumbnailUrl,
  };

  quiz.questions[index] = newQuestion;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  saveData();

  return { };
}

/**
 * Validates a question body against quiz requirements.
 * @param { QuestionInput['questionBody'] } questionBody - The question data from the request.
 * @param { Quiz } quiz - The quiz object containing existing questions.
 * @param { number } index - The index of the question being validated.
 * @param { number } flag - Flag indicating validation context (1 = updating existing question, other = new question).
 * @returns { EmptyObject } - Empty object on success.
 */
function validateNewQuestion(questionBody: QuestionInput['questionBody'], quiz: Quiz, index: number, flag: number): EmptyObject {
  validateQuestion(questionBody);

  validateAnswerOptions(questionBody);

  validateTimeLimit(questionBody, quiz, index, flag);

  validateThumbnailUrlForQuestion(questionBody);

  return { };
}

/**
 * Validates the basic properties of a question including text and points.
 * @param { QuestionInput['questionBody'] } questionBody - The question data to validate.
 * @param { Quiz } quiz - The quiz object (unused but kept for consistency).
 * @throws { BadRequestError } - if question is not between 5 and 50 characters long
 * @throws { BadRequestError } - if points awarded for a question if not between 1 and 10
 * @returns { EmptyObject } - Empty object if valid.
 *
 * Validation rules:
 * - Question text must be between 5 and 50 characters
 * - Points must be between 1 and 10
 */
function validateQuestion(questionBody: QuestionInput['questionBody']): EmptyObject {
  const { question, points } = questionBody;

  if (question.length < MIN_QUESTION_LENGTH || question.length > MAX_QUESTION_LENGTH) {
    throw new BadRequestError('INVALID_QUESTION', 'Question must be between 5 and 50 characters long.');
  }

  if (points < MIN_POINTS || points > MAX_POINTS) {
    throw new BadRequestError('INVALID_QUESTION', 'Points awarded for a question must be between 1 and 10.');
  }

  return { };
}

/**
 * Validates the answer options for a question.
 * @param { QuestionInput['questionBody'] } questionBody - The question data containing answer options.
 * @param { Quiz } quiz - The quiz object (unused but kept for consistency).
 * @throws { BadRequestError } - if question does not have between 2-6 answers
 * @throws { BadRequestError } - if length of answer was not between 1-30 characters long
 * @throws { BadRequestError } - if there are duplicate answers
 * @throws { BadRequestError } - if there are no answers marked as correct
 * @returns { EmptyObject } - Empty object if valid.
 *
 * Validation rules:
 * - Must have between 2 and 6 answer options
 * - Each answer text must be between 1 and 30 characters
 * - All answers must be unique (no duplicates)
 * - At least one answer must be marked as correct
 */
function validateAnswerOptions(questionBody: QuestionInput['questionBody']): EmptyObject {
  const { answerOptions } = questionBody;
  if (answerOptions.length < MIN_ANSWER_OPTIONS || answerOptions.length > MAX_ANSWER_OPTIONS) {
    throw new BadRequestError('INVALID_ANSWERS', 'Question must have 2-6 answers.');
  }
  if (answerOptions.some(a => a.answer.length < MIN_ANSWER_LENGTH || a.answer.length > MAX_ANSWER_LENGTH)) {
    throw new BadRequestError('INVALID_ANSWERS', 'Length of answer must be between 1-30 characters long.');
  }

  const answerStrings = answerOptions.map(option => option.answer);
  const uniqueAnswers = new Set(answerStrings);
  if (uniqueAnswers.size !== answerStrings.length) {
    throw new BadRequestError('INVALID_ANSWERS', 'Answers cannot be duplicates.');
  }

  if (!answerOptions.some(a => a.correct)) {
    throw new BadRequestError('INVALID_ANSWERS', 'At least one answer must be marked as correct.');
  }

  return { };
}

/**
 * Validates the time limit for a question and ensures total quiz time stays within bounds.
 * @param { QuestionInput['questionBody'] } questionBody - The question data containing the time limit.
 * @param { Quiz } quiz - The quiz object containing all existing questions.
 * @param { number } index - The index of the question being validated (used when updating).
 * @param { number } flag - Indicates validation mode (1 = update existing question, other = add new question).
 * @throws { BadRequestError } - if question timelimit is not greater than 0
 * @throws { BadRequestError } - Sum of all question timelimits exceeds 3 minutes
 * @returns { EmptyObject } - Empty object if valid.
 *
 * Validation rules:
 * - Time limit must be greater than 0
 * - Total sum of all question time limits in the quiz cannot exceed 180 seconds (3 minutes)
 * - When flag is 1 (update mode), the existing question's time is replaced with the new time
 * - When flag is not 1 (add mode), the new time is added to the total
 */
function validateTimeLimit(
  questionBody: QuestionInput['questionBody'],
  quiz: Quiz,
  index: number,
  flag: number
): EmptyObject {
  const { timeLimit } = questionBody;
  if (timeLimit <= MIN_TIME_LIMIT) {
    throw new BadRequestError('INVALID_TIMELIMIT', 'Question timeLimit must be greater than 0.');
  }

  let totalTime: number;

  if (flag === QUIZ_UPDATE_FLAG) {
    totalTime = quiz.questions!.reduce((sum, q) => sum + q.timeLimit, 0) + timeLimit - quiz.questions![index].timeLimit;
  } else {
    totalTime = quiz.questions!.reduce((sum, q) => sum + q.timeLimit, 0) + timeLimit;
  }

  if (totalTime > MAX_TOTAL_TIME_LIMIT) {
    throw new BadRequestError('INVALID_TIMELIMIT', 'Sum of all question timeLimits cannot exceed 3 minutes.');
  }

  return { };
}

/**
 * Validates the thumbnail URL for a question.
 * @param { QuestionInput['questionBody'] } questionBody - The question data containing the thumbnail URL.
 * @param { Quiz } quiz - The quiz object (unused but kept for consistency).
 * @throws { BadRequestError } - if thumbnailUrl is empty
 * @returns { EmptyObject } - Empty object if valid.
 *
 * Validation rules:
 * - Thumbnail URL cannot be empty or contain only whitespace
 * - Delegates to validateThumbnailUrl for additional URL format validation
 */
function validateThumbnailUrlForQuestion(questionBody: QuestionInput['questionBody']): EmptyObject {
  const { thumbnailUrl } = questionBody;
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    throw new BadRequestError('INVALID_THUMBNAIL', 'Thumbnail URL cannot be empty.');
  }

  validateThumbnailUrl(thumbnailUrl);

  return { };
}
