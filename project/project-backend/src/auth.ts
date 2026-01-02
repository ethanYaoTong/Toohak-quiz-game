import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import { getData, saveData } from './dataStore';
import crypto from 'crypto';
import { BadRequestError, UnauthorisedError } from './toohakError';
import { getUserFromSessionId } from './helpers';
import { DataStore, User, Session } from './types/internalTypes';
import { UserDetails, EmptyObject } from './types/externalTypes';

/**
 * Registers a new user with the given email, password, and names,
 * then returns the user's unique identifier.
 * @param { string } email - The new user's email.
 * @param { string } password - The new user's password.
 * @param { string } nameFirst - The new user's first name.
 * @param { string } nameLast - The new user's last name.
 * @returns { { session: string } }
 * Returns object containing the newly created session's `sessionId` on success.
 * @throws { BadRequestError }
 * If the email is invalid, already used, or if validation fails for the name or password.
 */
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): { session: string } {
  const data: DataStore = getData();

  if (!validator.isEmail(email)) {
    throw new BadRequestError('INVALID_EMAIL', 'Email does not satisfy email validator requirements');
  }

  if (findUserWithEmail(email)) {
    throw new BadRequestError('INVALID_EMAIL', 'Email address is already used by another user');
  }

  validateName(nameFirst, 'first');

  validateName(nameLast, 'last');

  validatePassword(password, 'PASSWORD');
  const hash = hashPassword(password);

  const newUser: User = {
    userId: data.nextUserId,
    nameFirst,
    nameLast,
    email,
    password: hash,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    oldPasswords: [],
  };

  data.users.push(newUser);
  data.nextUserId++;

  const newSession: Session = {
    sessionId: generateSessionId(),
    userId: newUser.userId,
  };

  data.sessions.push(newSession);
  saveData();

  return { session: newSession.sessionId };
}

/**
 * Helper function
 * Generates a SHA-256 hash of a password string.
 * @param {string} password - The plaintext password to hash
 * @returns {string} - Returns a 64-character hexadecimal string
 * representing the SHA-256 hash
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Helper function
 * Validates a user's first or last name.
 * @param { string } name - The name to validate.
 * @param { 'first' | 'last' } type - Whether the name is a first name or last name.
 * @throws { BadRequestError } - If the name is too short, too long, or contains invalid characters.
 */
function validateName(name: string, type: 'first' | 'last') {
  const errorType = `INVALID_${type.toUpperCase()}_NAME`;

  if (name.length < 2 || name.length > 20) {
    throw new BadRequestError(errorType, `${type} name must be between 2 and 20 characters.`);
  }

  const validNameRegex = /^[a-zA-Z\s\-']+$/;
  if (!validNameRegex.test(name)) {
    throw new BadRequestError(
      errorType,
      `${type} name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.`);
  }
}

/**
 * Helper functions
 * Validates a user's password or new password according to defined rules.
 * @param { string } password - The password to validate.
 * @param { 'PASSWORD' | 'NEW_PASSWORD' } type - Whether this is a current password or a new password.
 * @throws { BadRequestError } - If the password is too short, lacks a letter, or lacks a number.
 */
function validatePassword(
  password: string,
  type: 'PASSWORD' | 'NEW_PASSWORD'
) {
  const dataLabel = type === 'NEW_PASSWORD' ? 'New password' : 'Password';
  const errorCode = type === 'NEW_PASSWORD' ? 'INVALID_NEW_PASSWORD' : 'INVALID_PASSWORD';

  if (password.length < 8) {
    throw new BadRequestError(errorCode, `${dataLabel} must be at least 8 characters long.`);
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  if (!hasLetter) {
    throw new BadRequestError(errorCode, `${dataLabel} must contain at least one letter.`);
  }

  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    throw new BadRequestError(errorCode, `${dataLabel} must contain at least one number.`);
  }
}

/**
 * Helper function
 * Generate unique sessionId
 * @returns { string } - Unique sessionId
 */
function generateSessionId(): string {
  return uuidv4();
}

/**
 * Given a registered user's email and password, return their userId value.
 * @param { string } email - The email address of the user attempting to log in.
 * @param { string } password - The password associated with the user's account.
 * @returns { { userId: number } }
 * Returns an object containing the user's `userId` if authentication is successful.
 * @throws { BadRequestError } - If credentials are invalid
 */
export function adminAuthLogin(
  email: string,
  password: string
): { session: string } {
  const user = findUserWithEmail(email);
  const data: DataStore = getData();
  if (!user) {
    throw new BadRequestError('INVALID_CREDENTIALS', 'Email address does not exist.');
  }
  const hash = hashPassword(password);
  if (user.password !== hash) {
    user.numFailedPasswordsSinceLastLogin++;
    throw new BadRequestError('INVALID_CREDENTIALS', 'Password is incorrect.');
  }

  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;

  const newSession: Session = {
    sessionId: generateSessionId(),
    userId: user.userId,
  };

  data.sessions.push(newSession);
  saveData();

  return { session: newSession.sessionId };
  ;
}

/**
 * Helper function
 * Returns user with given email
 * @param { string } email - The email address of user
 * @returns { User | underfined } - Returns user with email address if found
 */
function findUserWithEmail(email: string): User | undefined {
  const data: DataStore = getData();
  return data.users.find(u => u.email === email);
}

/**
 * Given a valid session, log a user out.
 * @param { sessionId } string - The active session of a user trying to log out.
 * @returns { EmptyObject } - Returns an empty object { } if successful
 * @throws { UnauthorisedError } - If session is empty or invalid
 */
export function adminAuthLogout(
  sessionId: string | undefined
): EmptyObject {
  const data = getData();
  const indexToRemove = data.sessions.findIndex(target => target.sessionId === sessionId);

  if (indexToRemove !== -1) {
    data.sessions.splice(indexToRemove, 1);
    saveData();
    return {};
  } else {
    throw new UnauthorisedError('UNAUTHORISED', 'Session is empty or invalid.');
  }
}

/**
 * Retrieves detailed information about a specific user based on their userId.
 * @param { string } sessionId - The unique session identifier of the user.
 * @returns { { user: UserDetails } }
 * Returns an object containing the user's details (`UserDetails`) if successful.
 * @throws { UnauthorisedError } - If session is empty or invalid
 */
export function adminUserDetails(
  sessionId: string | undefined
): { user: UserDetails } {
  const user = getUserFromSessionId(sessionId);

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
    }
  };
}

/**
 * Updates the email and name details of a specific user.
 * @param { string } sessionId - The unique numerical identifier of the session.
 * @param { string } email - The new email address for the user.
 * @param { string } nameFirst - The new first name for the user.
 * @param { string } nameLast - The new last name for the user.
 * @returns { EmptyObject } Returns an empty object `{}` on successful update.
 * @throws { UnauthorisedError } - If session is empty or invalid
 * @throws { BadRequestError } - If email/first name/last name are invalid
 */
export function adminUserDetailsUpdate(
  sessionId: string | undefined,
  email: string,
  nameFirst: string,
  nameLast: string
): EmptyObject {
  const currentUser = getUserFromSessionId(sessionId);

  const existingUser = findUserWithEmail(email);

  if (existingUser && existingUser.userId !== currentUser.userId) {
    throw new BadRequestError('INVALID_EMAIL', 'Email is currently used by another user.');
  }

  if (!validator.isEmail(email)) {
    throw new BadRequestError('INVALID_EMAIL', 'Email is not valid.');
  }

  validateName(nameFirst, 'first');

  validateName(nameLast, 'last');

  currentUser!.email = email;
  currentUser!.nameFirst = nameFirst;
  currentUser!.nameLast = nameLast;
  saveData();

  return {};
}

/**
 * Updates the password of a user.
 * @param { string } sessionId - The unique numerical identifier of the session.
 * @param { string } oldPassword - The user's current password.
 * @param { string } newPassword - The new password to set for the user.
 * @returns { EmptyObject }
 * Returns an empty object `{}` on successful password update.
 * @throws { UnauthorisedError } - If session is empty or invalid
 * @throws { BadRequestError } - If old password/new password is invalid
 */
export function adminUserPasswordUpdate(
  sessionId: string | undefined,
  oldPassword: string,
  newPassword: string
): EmptyObject {
  const user = getUserFromSessionId(sessionId);

  if (user.password !== hashPassword(oldPassword)) {
    throw new BadRequestError('INVALID_OLD_PASSWORD', 'Old password is incorrect.');
  }

  if (newPassword === oldPassword) {
    throw new BadRequestError('INVALID_NEW_PASSWORD', 'New password is identical to old password.');
  }

  if (user.oldPasswords
    && user.oldPasswords.includes(hashPassword(newPassword))) {
    throw new BadRequestError('INVALID_NEW_PASSWORD', 'New password has already been used.');
  }

  validatePassword(newPassword, 'NEW_PASSWORD');

  user.oldPasswords.push(user!.password);
  user.password = hashPassword(newPassword);
  saveData();
  return {};
}
