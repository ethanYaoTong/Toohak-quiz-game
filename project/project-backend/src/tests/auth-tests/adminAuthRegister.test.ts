import { clearReq, registerReqExpect } from '../requestHelpers';

beforeEach(() => {
  clearReq();
});

describe('POST /v1/admin/auth/register', () => {
  describe('Successful registration', () => {
    test('returns sessionId for valid registration', () => {
      registerReqExpect('valid@gmail.com', 'Password123', 'Daniel', 'Wang');
    });

    test('returns unique sessionId for multiple registrations', () => {
      const res1 = registerReqExpect('user1@gmail.com', 'Password123', 'Kaiyu', 'Su');
      const res2 = registerReqExpect('user2@gmail.com', 'password456', 'Melissa', 'Liu');
      const res3 = registerReqExpect('user3@gmail.com', 'password789', 'Ethan', 'Tong');

      expect(res1.body).not.toStrictEqual(res2.body);
      expect(res1.body).not.toStrictEqual(res3.body);
      expect(res2.body).not.toStrictEqual(res3.body);
    });

    // Names variations
    test.each([
      { nameFirst: 'Mary-Jane', nameLast: 'Smith' },
      { nameFirst: "O'Brien", nameLast: "D'Angelo" },
      { nameFirst: 'Mary Jane', nameLast: 'Van Der Berg' },
      { nameFirst: 'JoHn', nameLast: 'DoE' },
      { nameFirst: 'Jo', nameLast: 'Li' },
      { nameFirst: 'Johnathanabrahamlinc', nameLast: 'Smithsonianwilliamso' },
      { nameFirst: ' John ', nameLast: 'Doe' },
    ])('accepts valid first and last name: $nameFirst $nameLast', ({ nameFirst, nameLast }) => {
      registerReqExpect('valid@gmail.com', 'Password123', nameFirst, nameLast);
    });

    // Password variations
    test.each([
      { password: 'pass123a' },
      { password: 'abc123def456' },
      { password: 'P@ssw0rd!' },
    ])('accepts valid password: $password', ({ password }) => {
      const res = registerReqExpect('valid@gmail.com', password, 'John', 'Doe');
      expect(res.body).toStrictEqual({ session: expect.any(String) });
    });
  });

  describe('Testing Errors', () => {
    // Duplicate email
    test('INVALID_EMAIL - duplicate email', () => {
      registerReqExpect('duplicate@gmail.com', 'Password123', 'John', 'Doe');
      registerReqExpect('duplicate@gmail.com', 'password456', 'Jane', 'Smith', 400, 'INVALID_EMAIL');
    });

    // Invalid email
    test('INVALID EMAIL - email does not satisfy email validator', () => {
      registerReqExpect('invalidemail', 'Password123', 'John', 'Doe', 400, 'INVALID_EMAIL');
    });

    // Invalid first names
    test.each([
      'J', 'Johnathanabrahamlinco', '', 'John123', 'John@', 'John_Doe', 'John.Jr',
    ])('INVALID_FIRST_NAME - returns error for first name: %s', (nameFirst) => {
      registerReqExpect('valid@gmail.com', 'Password123', nameFirst, 'Doe', 400, 'INVALID_FIRST_NAME');
    });

    // Invalid last names
    test.each([
      'D', 'Smithsonianwilliamson', '', 'Doe123', 'Doe@', 'Doe_Smith',
    ])('INVALID_LAST_NAME - returns error for last name: %s', (nameLast) => {
      registerReqExpect('valid@gmail.com', 'Password123', 'John', nameLast, 400, 'INVALID_LAST_NAME');
    });

    // Invalid passwords
    test.each([
      'pass123', 'passwordonly', '12345678', '!@#$%^&*', '12345!@#',
    ])('INVALID_PASSWORD - returns error for password: %s', (password) => {
      registerReqExpect('valid@gmail.com', password, 'John', 'Doe', 400, 'INVALID_PASSWORD');
    });
  });
});
