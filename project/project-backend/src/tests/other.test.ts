import {
  clearReq,
  registerReqExpect,
  loginReqExpect,
  quizCreateReqExpect,
  quizInfoReqExpect
} from './requestHelpers';
import { expectSuccess } from './testHelpers';
import fs from 'node:fs';
import { loadData } from '../dataStore';

beforeEach(() => {
  clearReq();
});

describe('/v1/clear', () => {
  test('empties the users and quizzes arrays', () => {
    // Register user
    const registerRes = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang', 200, 'OK');
    const sessionId = expectSuccess(registerRes.body).session;

    // Create quiz
    const createRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description', 200, 'OK');
    const quizId = expectSuccess(createRes.body).quizId;

    // Verify quiz exists before clear
    quizInfoReqExpect(sessionId, quizId, 200, 'OK');

    // Running clear
    clearReq();

    // Try logging in again with the same credentials (should fail)
    loginReqExpect('valid@gmail.com', 'Password123', 400, 'INVALID_CREDENTIALS');

    // Try accessing the quiz again (should fail)
    quizInfoReqExpect(sessionId, quizId, 401, 'UNAUTHORISED');
  });

  test('creates initial data when it does not exist', () => {
    const DATA_FILE = 'data.json';
    // delete file if it exists
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    expect(fs.existsSync(DATA_FILE)).toStrictEqual(false);
    loadData();
    expect(fs.existsSync(DATA_FILE)).toStrictEqual(true);
  });
});
