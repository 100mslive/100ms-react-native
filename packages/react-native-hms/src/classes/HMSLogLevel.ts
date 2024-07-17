/**
 * Enumeration for defining log levels in the HMS SDK for React Native applications.
 *
 * This enumeration provides a set of predefined log levels that can be used to control the verbosity of logging
 * within the HMS SDK. It allows developers to specify how much detail they want in their logs, which can be
 * helpful for debugging or monitoring the application's behavior.
 *
 * @enum {string}
 * @property {string} VERBOSE - Represents the most verbose log level, including detailed debug information.
 * @property {string} WARNING - Represents a log level for warning messages that might indicate potential issues.
 * @property {string} ERROR - Represents a log level for error messages indicating failures that need attention.
 */
export enum HMSLogLevel {
  VERBOSE = 'VERBOSE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
