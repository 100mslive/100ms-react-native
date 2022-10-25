import type { HMSLogAlarmManager } from './HMSLogAlarmManager';
import type { HMSLogLevel } from './HMSLogLevel';

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
