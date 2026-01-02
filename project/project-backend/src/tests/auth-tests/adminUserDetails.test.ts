import {
  clearReq,
  userDetailsReqExpect,
  registerReqExpect,
  loginReqExpect,
  logoutReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
describe('adminUserDetails', () => {
  let session1: SessionResult;
  let session2: SessionResult;

  beforeEach(() => {
    clearReq();

    const regRes1 = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
    const regRes2 = registerReqExpect('verynice@gmail.com', 'coolPassword123', 'Ethan', 'Bowen');

    session1 = expectSuccess(regRes1.body).session;
    session2 = expectSuccess(regRes2.body).session;
  });

  describe('Success Cases', () => {
    test('Should return correct user details for a valid sessionId', () => {
      const res = userDetailsReqExpect(session1);
      expect(res.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('Should increment numSuccessfulLogins on successful login', () => {
      loginReqExpect('valid@gmail.com', 'Password123');
      const res1 = userDetailsReqExpect(session1);

      expect(res1.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });

      loginReqExpect('valid@gmail.com', 'Password123');
      const res2 = userDetailsReqExpect(session1);
      expect(res2.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('Should track and reset numFailedPasswordsSinceLastLogin after successful login', () => {
      loginReqExpect('valid@gmail.com', 'wrongPassword', 400, 'INVALID_CREDENTIALS');
      loginReqExpect('valid@gmail.com', 'wrongPassword', 400, 'INVALID_CREDENTIALS');

      const res1 = userDetailsReqExpect(session1);
      expect(res1.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 2,
        },
      });

      loginReqExpect('valid@gmail.com', 'Password123');
      const res2 = userDetailsReqExpect(session1);
      expect(res2.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });

    test('Should handle multiple users independently', () => {
      loginReqExpect('valid@gmail.com', 'wrongPassword', 400, 'INVALID_CREDENTIALS');
      const res1 = userDetailsReqExpect(session1);
      expect(res1.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Daniel Wang',
          email: 'valid@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
        },
      });

      // Second user successfully logins
      loginReqExpect('verynice@gmail.com', 'coolPassword123');
      const res2 = userDetailsReqExpect(session2);
      expect(res2.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Ethan Bowen',
          email: 'verynice@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });
  });

  describe('Error Cases', () => {
    test('Should return UNAUTHORISED error for invalid session', () => {
      userDetailsReqExpect('invalidSessionId', 401, 'UNAUTHORISED');
    });

    test('Should return UNAUTHORISED error for empty session', () => {
      userDetailsReqExpect(undefined, 401, 'UNAUTHORISED');
    });

    test('Should return UNAUTHORISED error given a past session which has been deleted', () => {
      logoutReqExpect(session1);
      userDetailsReqExpect(session1, 401, 'UNAUTHORISED');
    });
  });
});
