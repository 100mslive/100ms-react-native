/**
 * Represents an exception specific to the HMS SDK in a React Native context.
 *
 * This class encapsulates detailed information about errors that can occur while interacting with the HMS SDK.
 * It includes a numeric code to identify the type of error, a human-readable description, and optionally,
 * a message, name, and action that are primarily available on Android. Additionally, it indicates whether
 * the error is terminal (i.e., cannot be recovered from) and whether a retry might be possible.
 *
 * @class HMSException
 * @property {number} code - Numeric error code representing the type of error.
 * @property {string} description - A brief, human-readable description of the error.
 * @property {string} [message] - Additional message information about the error (Android only).
 * @property {string} [name] - The name of the error (Android only).
 * @property {string} [action] - The action during which the error occurred (Android only).
 * @property {boolean} isTerminal - Indicates whether the error is terminal.
 * @property {boolean} [canRetry] - Indicates whether the operation that caused the error can be retried (Android only).
 *
 */
export class HMSException {
  code: number;
  description: string;
  message?: string; // `message` is available only on Android
  name?: string; // `name` is available only on Android
  action?: string; // `action` is available only on Android
  isTerminal: boolean;
  canRetry?: boolean; // `canRetry` is available only on Android

  constructor(params: {
    code: number;
    description: string;
    message?: string;
    name?: string;
    action?: string;
    isTerminal: boolean;
    canRetry?: boolean;
  }) {
    this.code = params.code;
    this.description = params.description;
    this.message = params.message;
    this.name = params.name;
    this.action = params.action;
    this.isTerminal = params.isTerminal;
    this.canRetry = params.canRetry;
  }
}
