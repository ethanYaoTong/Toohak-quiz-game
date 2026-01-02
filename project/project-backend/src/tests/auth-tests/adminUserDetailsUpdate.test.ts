import { clearReq,
  registerReqExpect,
  userDetailsUpdateReqExpect,
  userDetailsReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';

let sessionId: SessionResult;

beforeEach(() => {
  clearReq();
  const registerRes = registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
  sessionId = expectSuccess(registerRes.body).session;
});

describe('PUT /v1/admin/user/details', () => {
  test('successfully updates a valid user', () => {
    const result = userDetailsUpdateReqExpect(sessionId, 'new@gmail.com', 'Alice', 'Johnson');
    expect(result.body).toStrictEqual({});

    const details = userDetailsReqExpect(sessionId);
    expect(expectSuccess(details.body).user.email).toStrictEqual('new@gmail.com');
    expect(expectSuccess(details.body).user.name).toStrictEqual('Alice Johnson');
  });

  describe('Testing error messages', () => {
    test('Unauthorised for empty session', () => {
      userDetailsUpdateReqExpect(undefined, 'yuhh@example.com', 'Alice', 'Johnson', 401, 'UNAUTHORISED');
    });

    test('Unauthorised for invalid session', () => {
      userDetailsUpdateReqExpect('invalidSessionId', 'yuhh@example.com', 'Alice', 'Johnson', 401, 'UNAUTHORISED');
    });

    describe('Invalid Email', () => {
      test('Email is currently used by another user', () => {
        const registerRes = registerReqExpect('melissaliu@email.com', 'Password123', 'Melissa', 'Liu');
        const sessionId2 = expectSuccess(registerRes.body).session;
        userDetailsUpdateReqExpect(sessionId2, 'valid@gmail.com', 'Melissa', 'Liu', 400, 'INVALID_EMAIL');
      });

      test('Email is not valid', () => {
        userDetailsUpdateReqExpect(sessionId, 'invalidgmail.com', 'Melissa', 'Liu', 400, 'INVALID_EMAIL');
      });
    });

    describe('Invalid First Name', () => {
      test('First name contains invalid characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'Alice333', 'Johnson', 400, 'INVALID_FIRST_NAME');
      });

      test('First name is more than 20 characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'AliceJohnsonIsVeryAwesome', 'Johnson', 400, 'INVALID_FIRST_NAME');
      });

      test('First name is less than 2 characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'a', 'Johnson', 400, 'INVALID_FIRST_NAME');
      });
    });

    describe('Invalid Last Name', () => {
      test('Last name contains invalid characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'Alice', 'Johnson#$%^', 400, 'INVALID_LAST_NAME');
      });

      test('Last name is more than 20 characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'Alice', 'HelloMyLastNameIsJohnson', 400, 'INVALID_LAST_NAME');
      });

      test('Last name is less than 2 characters', () => {
        userDetailsUpdateReqExpect(sessionId, 'alicejohnson@email.com', 'Alice', 'j', 400, 'INVALID_LAST_NAME');
      });
    });
  });
});
