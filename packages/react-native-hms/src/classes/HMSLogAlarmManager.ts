/**
 * Enumeration for managing log alarm settings in HMS SDK for React Native applications. Android only.
 *
 * This enumeration defines constants used to configure the alarm manager for log files in the HMS SDK.
 * It includes settings for the default directory size, default log file name, and maximum directory size,
 * allowing for detailed control over how log files are managed and stored.
 *
 * @enum {string}
 * @property {string} DEFAULT_DIR_SIZE - Represents the default size for the log directory.
 * @property {string} DEFAULT_LOGS_FILE_NAME - Represents the default name for log files.
 * @property {string} MAX_DIR_SIZE - Represents the maximum size for the log directory.
 */
export enum HMSLogAlarmManager {
  DEFAULT_DIR_SIZE = 'DEFAULT_DIR_SIZE',
  DEFAULT_LOGS_FILE_NAME = 'DEFAULT_LOGS_FILE_NAME',
  MAX_DIR_SIZE = 'MAX_DIR_SIZE',
}
