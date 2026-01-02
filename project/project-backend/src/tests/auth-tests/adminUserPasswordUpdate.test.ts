import {
  clearReq,
  loginReqExpect,
  userPasswordUpdateReqExpect,
  registerReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();
  const registerRes = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
  sessionId = expectSuccess(registerRes.body).session;
});

describe('adminUserPasswordUpdate function', () => {
  test('successfully updates password with valid details', () => {
    const result = userPasswordUpdateReqExpect(sessionId, 'Password123', 'NewPass123');
    expect(result.body).toStrictEqual({});
    loginReqExpect('valid@gmail.com', 'NewPass123');
  });

  describe('Testing error messages', () => {
    test('Unauthorised  - Invalid session id given', () => {
      userPasswordUpdateReqExpect('invalidSessionId', 'Password123', 'NewPass123', 401, 'UNAUTHORISED');
    });

    test('Unauthorised  - Session id does not exist', () => {
      userPasswordUpdateReqExpect(undefined, 'Password123', 'NewPass123', 401, 'UNAUTHORISED');
    });

    test('Invalid Old Password', () => {
      userPasswordUpdateReqExpect(sessionId, 'A123456789', 'NewPass123', 400, 'INVALID_OLD_PASSWORD');
    });

    describe('Invalid New Password', () => {
      test('Old Password and New Password match exactly', () => {
        userPasswordUpdateReqExpect(sessionId, 'Password123', 'Password123', 400, 'INVALID_NEW_PASSWORD');
      });

      test('New Password has already been used before by this user', () => {
        userPasswordUpdateReqExpect(sessionId, 'Password123', 'NewPass123');
        userPasswordUpdateReqExpect(sessionId, 'NewPass123', 'Password123', 400, 'INVALID_NEW_PASSWORD');
      });

      test('New Password is less than 8 characters', () => {
        userPasswordUpdateReqExpect(sessionId, 'Password123', 'NewPas1', 400, 'INVALID_NEW_PASSWORD');
      });

      test('New Password does not contain at least one number', () => {
        userPasswordUpdateReqExpect(sessionId, 'Password123', 'NewPassssss', 400, 'INVALID_NEW_PASSWORD');
      });

      test('New Password does not contain at least one letter', () => {
        userPasswordUpdateReqExpect(sessionId, 'Password123', '123456789', 400, 'INVALID_NEW_PASSWORD');
      });
    });
  });
});
