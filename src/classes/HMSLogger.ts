import { HMSLogLevel } from './HMSLogLevel';

export class HMSLogger {
  _verbose: Boolean = false;
  _warning: Boolean = false;
  _error: Boolean = false;

  constructor(params?: { verbose: Boolean; warning: Boolean; error: Boolean }) {
    if (params) {
      this._verbose = params.verbose;
      this._warning = params.warning;
      this._error = params.error;
    }
  }

  verbose(message: String) {
    if (this._verbose === true) {
      console.log(message);
    }
  }

  warn(message: String) {
    if (this._warning) {
      console.log(message);
    }
  }

  error(message: String) {
    if (this._error) {
      console.log(message);
    }
  }

  updateLogLevel(level: HMSLogLevel, value: Boolean) {
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
