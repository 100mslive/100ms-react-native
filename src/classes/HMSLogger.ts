import { HMSLogLevel } from './HMSLogLevel';

export class HMSLogger {
  private _verbose: boolean = false;
  private _warning: boolean = false;
  private _error: boolean = false;

  constructor(params?: { verbose: boolean; warning: boolean; error: boolean }) {
    if (params) {
      this._verbose = params.verbose;
      this._warning = params.warning;
      this._error = params.error;
    }
  }

  verbose(message: string, data: any) {
    if (this._verbose === true) {
      console.log(message, data);
    }
  }

  warn(message: string, data: any) {
    if (this._warning) {
      console.warn(message, data);
    }
  }

  error(message: string, data: any) {
    if (this._error) {
      console.error(message, data);
    }
  }

  updateLogLevel(level: HMSLogLevel, value: boolean) {
    switch (level) {
      case HMSLogLevel.VERBOSE: {
        this._verbose = value;
        return;
      }
      case HMSLogLevel.WARNING: {
        this._warning = value;
        return;
      }
      case HMSLogLevel.ERROR: {
        this._error = value;
        return;
      }
      default: {
        return;
      }
    }
  }
}
