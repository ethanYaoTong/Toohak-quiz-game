// A custom error class to help you raise exceptions with both the error type and message.
// You are not required to use this, nor expected to understand how a class works.
// Feel free to extend it, add better type checking, or create your own.
// See section 5.6 for more details!

export class ToohakError extends Error {
  error: string;

  constructor(error: string, message: string) {
    super(message);
    this.error = error;
  }
}

/** Error 400 */
export class BadRequestError extends ToohakError { }

/** Error 401 */
export class UnauthorisedError extends ToohakError { }

/** Error 403 */
export class ForbiddenError extends ToohakError { }

/**
 * Example usage:
 *
 * // implementation.ts
 *
 * import { ToohakError } from './toohakError';
 *
 * function myFunction(userId: number) {
 *   if (!userExists(userId)) {
 *     throw new ToohakError('UNAUTHORISED', 'User did not exist.');
 *   }
 *
 *   ...
 * }
 *
 *
 *
 * // server.ts
 *
 * try {
 *   const res = myFunction(userId);
 *
 *   ...
 * } catch (e) {
 *   // Check if `e` is a ToohakError.
 *   if (e instanceof ToohakError) {
 *     // `e` is a ToohakError, unwrap it and respond with error object.
 *     const error = e.error;
 *     const message = e.message;
 *
 *     ...
 *   } else {
 *     // `e` is not a ToohakError.
 *
 *     ...
 *   }
 * }
 */
