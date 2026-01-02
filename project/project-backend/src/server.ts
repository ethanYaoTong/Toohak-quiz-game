import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
import { loadData } from './dataStore';

import {
  adminAuthLogout,
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizThumbnailUpdate,
  adminQuizInfo,
  adminQuizCreateQuestion,
  adminQuizRemoveQuestion,
  adminQuizRemoveQuestionV2,
  adminQuizDescriptionUpdate,
  adminQuizUpdateQuestion,
  adminQuizRemove,
  adminQuizRemoveV2,
  adminQuizNameUpdate
} from './quiz';

import {
  adminQuizGames,
  adminQuizGameStart,
  adminQuizGameStateUpdate,
  adminQuizGameStatus,
  adminQuizGameResults
} from './game';

import {
  playerQuestionAnswer,
  playerGetStatus,
  playerJoinGame,
  playerQuestionInfo,
  playerQuestionResults,
  playerGameResults
} from './player';

import {
  ToohakError,
  BadRequestError,
  ForbiddenError,
  UnauthorisedError
} from './toohakError';

// Set up web app
const app = express();

// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

// Load persisted data when server starts
loadData();

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file),
    { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }
  ));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

app.get('/echo', (req: Request, res: Response) => {
  const echo = req.query.echo as string;

  if (echo === 'echo') {
    return res.status(400).json({
      error: 'INVALID_ECHO',
      message: 'The echo value cannot be "echo"',
    });
  }
  return res.status(200).json({ value: echo });
});

// ========================================================================= //
// Helper
// ========================================================================= //
/**
 * Given an exception, handle it by sending the appropriate status code.
 * @param e an error object. If the error type is unknown, it will be re-thrown
 * @param res express response object
 */
function handleToohakError(res: Response, e: unknown) {
  if (e instanceof ToohakError) {
    let statusCode = 500;

    if (e instanceof BadRequestError) {
      statusCode = 400;
    } else if (e instanceof ForbiddenError) {
      statusCode = 403;
    } else if (e instanceof UnauthorisedError) {
      statusCode = 401;
    }
    return res.status(statusCode).json({ error: e.error, message: e.message });
  }

  // else {
  //   throw e;
  // }
}

// ========================================================================= //
// Clear route
// ========================================================================= //
/**
 * Reset state of application back to start/its initial state
 */
app.delete('/v1/clear', (req: Request, res: Response) => {
  return res.status(200).json(clear());
});

// ========================================================================= //
// Auth routes
// ========================================================================= //
/**
 * Register a new admin user
 */
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Login an admin user
 */
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = adminAuthLogin(email, password);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Logs out an admin user who has an active user session
 */
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const result = adminAuthLogout(sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Gets the details of an admin user
 */
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const result = adminUserDetails(sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Updates the details of an admin user
 */
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const { email, nameFirst, nameLast } = req.body;

    const result = adminUserDetailsUpdate(sessionId, email, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Updates the password of this admin user
 */
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const { oldPassword, newPassword } = req.body;

    const result = adminUserPasswordUpdate(sessionId, oldPassword, newPassword);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

// ========================================================================= //
// Quiz routes
// ========================================================================= //
/**
 * Lists all user's quizzes
 */
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const result = adminQuizList(sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Create a new quiz
 */
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const { name, description } = req.body;

    const result = adminQuizCreate(sessionId, name, description);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Delete a quiz
 */
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);

    const result = adminQuizRemove(sessionId, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Delete a quiz V2
 */
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);

    const result = adminQuizRemoveV2(sessionId, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Get info about current quiz
 */
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  try {
    const userSessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);

    const result = adminQuizInfo(userSessionId, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Update quiz name
 */
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  try {
    const userSessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const { name } = req.body;

    const result = adminQuizNameUpdate(userSessionId, quizId, name);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Update quiz description
 */
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const { description } = req.body;

    const result = adminQuizDescriptionUpdate(sessionId, quizId, description);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Update the quiz thumbnail
 */
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const { thumbnailUrl } = req.body;

    const result = adminQuizThumbnailUpdate(sessionId, quizId, thumbnailUrl);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Create quiz question
 */
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const { questionBody } = req.body;

    const result = adminQuizCreateQuestion(sessionId, quizId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Update quiz question
 */
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const { questionBody } = req.body;

    const result = adminQuizUpdateQuestion(sessionId, quizId, questionId, questionBody);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Delete quiz question v2
 */
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const sessionId = req.header('session');

    const result = adminQuizRemoveQuestionV2(quizId, questionId, sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Delete quiz question
 */
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const sessionId = req.header('session');

    const result = adminQuizRemoveQuestion(quizId, questionId, sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

// ========================================================================= //
// Game routes
// ========================================================================= //
/**
 * View active and inactive quiz games
 */
app.get('/v1/admin/quiz/:quizid/games', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);

    const result = adminQuizGames(sessionId, quizId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 *
 * Start a new game for quiz
 */
app.post('/v1/admin/quiz/:quizid/game/start', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const { autoStartNum } = req.body;

    const result = adminQuizGameStart(sessionId, quizId, autoStartNum);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Update a new game state
 */
app.put('/v1/admin/quiz/:quizid/game/:gameid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const gameId = parseInt(req.params.gameid);
    const { action } = req.body;

    const result = adminQuizGameStateUpdate(sessionId, quizId, gameId, action);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Get quiz game status
 */
app.get('/v1/admin/quiz/:quizid/game/:gameid', (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizid);
    const gameId = parseInt(req.params.gameid);
    const sessionId = req.header('session');

    const result = adminQuizGameStatus(sessionId, quizId, gameId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Get quiz game final results
 */
app.get('/v1/admin/quiz/:quizid/game/:gameid/results', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('session');
    const quizId = parseInt(req.params.quizid);
    const gameId = parseInt(req.params.gameid);

    const result = adminQuizGameResults(sessionId, quizId, gameId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

// ========================================================================= //
// Player routes
// ========================================================================= //
/**
 * Get player status
 */
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerid);

    const result = playerGetStatus(playerId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Allow a guest player to join a game.
 */
app.post('/v1/player/join', (req: Request, res: Response) => {
  try {
    const { gameId, playerName } = req.body;

    const result = playerJoinGame(gameId, playerName);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Allows a player to answer a question
 */
app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);
    const { answerIds } = req.body;

    const result = playerQuestionAnswer(playerId, questionPosition, answerIds);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  };
});

/**
 * Current question information for a player.
 */
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);

    const result = playerQuestionInfo(playerId, questionPosition);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * Get results for a particular question
 */
app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);

    const result = playerQuestionResults(playerId, questionPosition);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

/**
 * View player game result
 */
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.playerid);

    const result = playerGameResults(playerId);
    return res.status(200).json(result);
  } catch (e) {
    return handleToohakError(res, e);
  }
});

// ========================================================================= //
app.use((req: Request, res: Response) => {
  const message = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using 'npm start' (instead of 'npm run dev') to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;

  res.status(404).json({ error: 'ROUTE_NOT_FOUND', message });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
