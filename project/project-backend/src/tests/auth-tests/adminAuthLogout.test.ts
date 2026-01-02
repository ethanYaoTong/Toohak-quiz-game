import { clearReq, logoutReqExpect, registerReqExpect } from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
beforeEach(() => {
  clearReq();
});

describe('POST /v1/admin/auth/logout', () => {
  describe('Success Cases', () => {
    test('Successful logout', () => {
      const registerRes1 = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
      const registerRes2 = registerReqExpect('verynice@gmail.com', 'Password123', 'Ethan', 'Bowen');

      const sessionId1 = expectSuccess(registerRes1.body).session;
      const sessionId2 = expectSuccess(registerRes2.body).session;

      logoutReqExpect(sessionId1);
      logoutReqExpect(sessionId2);
    });
  });

  describe('Error Cases', () => {
    test ('Session empty', () => {
      logoutReqExpect(undefined, 401, 'UNAUTHORISED');
    });

    test ('Session invalid', () => {
      logoutReqExpect('invalidSessionId', 401, 'UNAUTHORISED');
    });

    test ('Unauthorised attempt to logout after already logging out', () => {
      const registerRes = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
      const sessionId = expectSuccess(registerRes.body).session;

      logoutReqExpect(sessionId);
      logoutReqExpect(sessionId, 401, 'UNAUTHORISED');
    });
  });
});
