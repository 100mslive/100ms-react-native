import type { HMSLogAlarmManager } from './HMSLogAlarmManager';
import type { HMSLogLevel } from './HMSLogLevel';

/**
 * Represents the logging settings for the HMS SDK.
 *
 * This class encapsulates the settings related to logging within the HMS SDK, including the log level,
 * whether log storage is enabled, and the maximum directory size for log storage.
 * It is used to configure how logs are handled by the SDK, allowing for customization of log verbosity and storage requirements.
 *
 * @class HMSLogSettings
 * @property {HMSLogLevel} level - The log level setting, determining the verbosity of the logs.
 * @property {boolean} isLogStorageEnabled - Flag indicating whether log storage is enabled. Android only.
 * @property {HMSLogAlarmManager} maxDirSizeInBytes - The maximum size of the log directory in bytes, managed by an instance of HMSLogAlarmManager. Android only.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/debugging/logger
 */
export class HMSLogSettings {
  level: HMSLogLevel;
  isLogStorageEnabled: boolean;
  maxDirSizeInBytes: HMSLogAlarmManager;

  constructor(params: {
    level: HMSLogLevel;
    isLogStorageEnabled: boolean;
    maxDirSizeInBytes: HMSLogAlarmManager;
  }) {
    this.level = params.level;
    this.isLogStorageEnabled = params.isLogStorageEnabled;
    this.maxDirSizeInBytes = params.maxDirSizeInBytes;
  }
}
