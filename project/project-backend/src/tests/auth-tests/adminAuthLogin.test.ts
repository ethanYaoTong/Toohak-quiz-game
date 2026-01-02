import { clearReq, registerReqExpect, loginReqExpect, LoginResult } from '../requestHelpers';

let loginResult: LoginResult;

beforeEach(() => {
  clearReq();
  registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
  loginResult = loginReqExpect('valid@gmail.com', 'Password123');
});

describe('POST /v1/admin/auth/login', () => {
  describe('Successful login', () => {
    test('returns sessionId for valid login credentials', () => {
      // loginResult is already validated by loginReqExpect in beforeEach
      expect(loginResult.body).toStrictEqual({ session: expect.any(String) });
    });

    test('returns unique sessionId for new logins with multiple users', () => {
      // Register and create a newUser and compare the sessionId
      registerReqExpect('newUser@gmail.com', 'newPassword123', 'Melissa', 'Liu');
      const newUserLogin = loginReqExpect('newUser@gmail.com', 'newPassword123');

      expect(newUserLogin.body).not.toStrictEqual(loginResult.body);
    });
  });

  describe('Testing Errors', () => {
    test('returns error when email is not registered', () => {
      loginReqExpect('nonexistent@gmail.com', 'Password123', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error when email is empty string', () => {
      loginReqExpect('', 'Password123', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error for email with extra characters', () => {
      loginReqExpect('valid@gmail.comm', 'Password123', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error for email with spaces', () => {
      loginReqExpect('valid @gmail.com', 'Password123', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error when password is incorrect', () => {
      loginReqExpect('valid@gmail.com', 'incorrectPassword', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error when password is empty string', () => {
      loginReqExpect('valid@gmail.com', '', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error for password with wrong case (case-sensitive)', () => {
      loginReqExpect('valid@gmail.com', 'password123', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error when both email and password are wrong', () => {
      loginReqExpect('invalid@gmail.com', 'incorrectPassword', 400, 'INVALID_CREDENTIALS');
    });

    test('returns error when email exists but password is for different user', () => {
      // Register a newUser
      registerReqExpect('newUser@gmail.com', 'newPassword123', 'Melissa', 'Liu');
      loginReqExpect('valid@gmail.com', 'newPassword123', 400, 'INVALID_CREDENTIALS');
    });

    test('multiple failed login attempts still allow successful login', () => {
      loginReqExpect('valid@gmail.com', 'incorrectPassword1', 400, 'INVALID_CREDENTIALS');
      loginReqExpect('valid@gmail.com', 'incorrectPassword2', 400, 'INVALID_CREDENTIALS');

      const successfulLogin = loginReqExpect('valid@gmail.com', 'Password123');
      expect(successfulLogin.body).toStrictEqual({ session: expect.any(String) });
    });
  });
});
