import slync from 'slync';
import {
  clearReq,
  registerReqExpect,
  quizCreateReqExpect,
  quizCreateQuestionReqExpect,
  quizInfoReqExpect,
  SessionResult
} from '../requestHelpers';
import { expectSuccess } from '../testHelpers';

let quizId: number;
let sessionId: SessionResult;

beforeEach(() => {
  clearReq();
  const res = registerReqExpect('ilove@1531.com', 'yessir123', 'Abu', 'Albagdaddy');
  sessionId = expectSuccess(res.body).session;

  // Create a quiz first
  const quizRes = quizCreateReqExpect(sessionId, 'Quiz 1', 'Quiz 1 description');
  quizId = expectSuccess(quizRes.body).quizId;
});

describe('POST /v1/admin/quiz/:quizId/question', () => {
  describe('Successful Question Creation', () => {
    test('Creates question for valid quizId and questionBody', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Who is the Monarch of England?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            { answer: 'Charles', correct: true },
            { answer: 'Harry', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        }
      );
    });
  });

  describe('Validation Errors', () => {
    test('fails when question is too short', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Why?',
          timeLimit: 5,
          points: 5,
          answerOptions: [
            { answer: 'Yippee', correct: true },
            { answer: 'Naur', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });

    test('fails when question is too long', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'a'.repeat(55),
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Option 1', correct: true },
            { answer: 'Option 2', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });

    test('fails with invalid points', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Do I like programming',
          timeLimit: 10,
          points: 100,
          answerOptions: [
            { answer: 'yuhh ts fire', correct: true },
            { answer: 'nah u trippin', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_QUESTION'
      );
    });

    test('fails with too few answers', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'What call fish with no eye?',
          timeLimit: 10,
          points: 5,
          answerOptions: [{ answer: 'fshhhhh', correct: true }],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_ANSWERS'
      );
    });

    test('fails with too many answers', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'When did world war 2 end?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: '2025', correct: false },
            { answer: 'it never ended :(', correct: false },
            { answer: 'the real war is getting through this term', correct: false },
            { answer: '1943', correct: false },
            { answer: '1944', correct: false },
            { answer: '1945', correct: true },
            { answer: '1946', correct: false }
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_ANSWERS'
      );
    });

    test('fails when length of answer option is too short', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Who is the Monarch of England?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: '', correct: true },
            { answer: 'pleasegivefullmarksforthiscoursethanksMADDY', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_ANSWERS'
      );
    });

    test('fails with duplicate answers', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Why is my group so smart?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'They the goats fr', correct: true },
            { answer: 'They the goats fr', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_ANSWERS'
      );
    });

    test('fails when no correct answer is provided', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Who is the Monarch of England?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Winston Churchill', correct: false },
            { answer: 'Donald Trump', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_ANSWERS'
      );
    });

    test('fails when timeLimit is invalid', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'What is the most bombed country?',
          timeLimit: 0,
          points: 5,
          answerOptions: [
            { answer: 'Bombaclat', correct: true },
            { answer: 'boomer', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_TIMELIMIT'
      );
    });

    test('fails when sum of question timeLimits exceeds quiz timeLimit', () => {
      // Create first question with timeLimit 10
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Have a nice day?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'YES', correct: true },
            { answer: 'NO', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        }
      );

      // Now, try to create a second question that would exceed the quiz timeLimit
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Good afternoon, good evening, and good night?',
          timeLimit: 175,
          points: 5,
          answerOptions: [
            { answer: 'Truman from Truman Show', correct: true },
            { answer: 'John Cena', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        400,
        'INVALID_TIMELIMIT'
      );
    });

    test('fails when thumbnail is empty', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'MaddyCanwegetfullmarksPLEASE?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'YES OF COURSE', correct: true },
            { answer: 'Ill think about it', correct: false },
          ],
          thumbnailUrl: '',
        },
        400,
        'INVALID_THUMBNAIL'
      );
    });

    test('fails when thumbnail has invalid extension', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Bob the buidler, can he fix it?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'yes', correct: true },
            { answer: 'no', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.gif',
        },
        400,
        'INVALID_THUMBNAIL'
      );
    });

    test('fails when thumbnail has invalid protocol', () => {
      quizCreateQuestionReqExpect(
        sessionId,
        quizId,
        {
          question: 'Whats my real ethnicity?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Chinese', correct: true },
            { answer: 'Korean', correct: false },
          ],
          thumbnailUrl: 'ftp://example.com/image.jpg',
        },
        400,
        'INVALID_THUMBNAIL'
      );
    });
  });

  describe('Authorization Errors', () => {
    test('fails when session is missing', () => {
      quizCreateQuestionReqExpect(
        undefined,
        quizId,
        {
          question: 'How to defend against princess in clash royale?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'Mega Knight', correct: true },
            { answer: 'Log', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        401,
        'UNAUTHORISED'
      );
    });
    test('fails when session is invalid', () => {
      quizCreateQuestionReqExpect(
        'ireallyenjoycomp1531itsmyfavourite',
        quizId,
        {
          question: 'Can I swim?',
          timeLimit: 10,
          points: 5,
          answerOptions: [
            { answer: 'No', correct: true },
            { answer: 'Yes', correct: false },
          ],
          thumbnailUrl: 'http://example.com/image.jpg',
        },
        401,
        'UNAUTHORISED'
      );
    });
  });

  test('fails when user is not owner of the quiz', () => {
    const reg2 = registerReqExpect('givemefood@gmail.com', 'password123', 'Adebayo', 'Akinfenwa');
    const sessionId2 = expectSuccess(reg2.body).session;

    quizCreateQuestionReqExpect(
      sessionId2,
      quizId,
      {
        question: 'Which operating system is better?',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'Linux', correct: true },
          { answer: 'Windows', correct: false },
        ],
        thumbnailUrl: 'http://example.com/image.jpg',
      },
      403,
      'INVALID_QUIZ_ID'
    );
  });

  test('fails when quiz does not exist', () => {
    quizCreateQuestionReqExpect(
      sessionId,
      quizId + 1,
      {
        question: 'Fake question',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'A', correct: true },
          { answer: 'B', correct: false },
        ],
        thumbnailUrl: 'http://example.com/image.jpg',
      },
      403,
      'INVALID_QUIZ_ID'
    );
  });

  test('Successfully updates timeLastEdited when a question is added', () => {
    const quizBefore = quizInfoReqExpect(sessionId, quizId);
    const timeLastEditedBefore = expectSuccess(quizBefore.body).timeLastEdited;

    slync(1000);
    const now = Math.floor(Date.now() / 1000);

    quizCreateQuestionReqExpect(
      sessionId,
      quizId,
      {
        question: 'Who is the Monarch of England?',
        timeLimit: 10,
        points: 5,
        answerOptions: [
          { answer: 'King Charles', correct: true },
          { answer: 'Prince Harry', correct: false },
        ],
        thumbnailUrl: 'http://example.com/image.jpg',
      }
    );

    const quizAfter = quizInfoReqExpect(sessionId, quizId);
    const timeLastEditedAfter = expectSuccess(quizAfter.body).timeLastEdited;

    expect(timeLastEditedAfter).toBeGreaterThan(timeLastEditedBefore);
    expect(timeLastEditedAfter).toBeLessThanOrEqual(now + 1);
  });
});
