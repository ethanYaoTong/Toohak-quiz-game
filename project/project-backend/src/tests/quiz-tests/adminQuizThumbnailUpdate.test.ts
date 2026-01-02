import slync from 'slync';
import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizInfoReqExpect,
  quizThumbnailUpdateReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';
let sessionId: SessionResult;

beforeEach(() => {
  // Clear data before each test
  clearReq();

  // Register a default user for all tests
  const res = registerReqExpect('user1@email.com', 'A12345678', 'Alice', 'Smith');
  sessionId = expectSuccess(res.body).session;
});

describe('PUT /v1/admin/quiz/{quizid}/thumbnail', () => {
  describe('Error handling', () => {
    describe('401 - Unauthorised user', () => {
      test('Invalid session', () => {
        // Clear again to remove session
        clearReq();
        quizThumbnailUpdateReqExpect(sessionId, 1, 'http://google.com/image.jpg', 401, 'UNAUTHORISED');
      });

      test('Empty session', () => {
        quizThumbnailUpdateReqExpect(undefined, 1, 'http://google.com/image.jpg', 401, 'UNAUTHORISED');
      });
    });

    describe('403 - Invalid quizId', () => {
      test('Quiz does not exist', () => {
        quizThumbnailUpdateReqExpect(sessionId, 1, 'http://google.com/image.jpg', 403, 'INVALID_QUIZ_ID');
      });

      test('User is not owner of this quiz', () => {
        // Create quiz under Alice Smith
        const createRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
        const quizId = expectSuccess(createRes.body).quizId;

        // Create second user Bob Smith
        const reg2 = registerReqExpect('user2@email.com', 'A12345678', 'Bob', 'Smith');
        const sessionId2 = expectSuccess(reg2.body).session;

        // Bob Smith attempts update of Alice Smith's quiz
        quizThumbnailUpdateReqExpect(sessionId2, quizId, 'http://google.com/image.jpg', 403, 'INVALID_QUIZ_ID');
      });
    });

    describe('400 - Invalid thumbnail', () => {
      let quizId: number;
      beforeEach(() => {
        const res = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
        quizId = expectSuccess(res.body).quizId;
      });

      test('Does not end with correct filetypes', () => {
        quizThumbnailUpdateReqExpect(sessionId, quizId, 'http://google.com/image.gif', 400, 'INVALID_THUMBNAIL');
      });

      test("Does not begin with 'http://' or 'https://'", () => {
        quizThumbnailUpdateReqExpect(sessionId, quizId, 'google.com/image.jpg', 400, 'INVALID_THUMBNAIL');
      });
    });
  });

  describe('Success cases', () => {
    let quizId: number;

    beforeEach(() => {
      // Create a quiz for testing
      const res = quizCreateReqExpect(sessionId, 'Quiz Success', 'Quiz for success tests');
      quizId = expectSuccess(res.body).quizId;
    });

    describe('Successfully updates for different file types', () => {
      test.each([
        ['Valid file type: jpeg', 'https://example.com/image.jpg'],
        ['Valid file type: jpeg', 'https://example.com/image.jpeg'],
        ['Valid file type: png', 'https://example.com/image.png']
      ])('%s', (_, validThumbnail) => {
        quizThumbnailUpdateReqExpect(sessionId, quizId, validThumbnail);
      });
    });

    describe("Successfully updates for both 'http://' and 'https://'", () => {
      test.each([
        ["Begins with 'http://'", 'http://example.com/image.jpg'],
        ["Begins with 'https://'", 'https://example.com/image.jpg']
      ])('%s', (_, validThumbnail) => {
        quizThumbnailUpdateReqExpect(sessionId, quizId, validThumbnail);
      });
    });

    test('Successfully updates timeLastEdited', () => {
      const quizInfoBefore = quizInfoReqExpect(sessionId, quizId);
      const timeLastEditedBefore = expectSuccess(quizInfoBefore.body).timeLastEdited;

      slync(1000);
      const now = Math.floor(Date.now() / 1000);

      quizThumbnailUpdateReqExpect(sessionId, quizId, 'https://example.com/image.jpg');

      const quizInfoAfter = quizInfoReqExpect(sessionId, quizId);
      const timeLastEditedAfter = expectSuccess(quizInfoAfter.body).timeLastEdited;

      expect(timeLastEditedAfter).toBeGreaterThan(timeLastEditedBefore);
      expect(timeLastEditedAfter).toBeLessThanOrEqual(now + 1);
    });
  });
});
