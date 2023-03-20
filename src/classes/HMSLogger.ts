import { HMSLogLevel } from './HMSLogLevel';

export let logger: HMSLogger | undefined;

export const getLogger = () => {
  return logger;
};

export const setLogger = (id: string, hmsLogger?: HMSLogger) => {
  logger = hmsLogger;
  hmsLogger?.verbose('#Function setLogger', { id });
};

export class HMSLogger {
  private _verbose: boolean = false;
  private _warning: boolean = false;
  private _error: boolean = false;
  private logs: {
    type: 'verbose' | 'warn' | 'error';
    timestamp: string;
    message: string;
    data: any;
    id: string;
  }[] = [];
  private onLog?: Function;

  constructor(params?: { verbose: boolean; warning: boolean; error: boolean }) {
    if (params) {
      this._verbose = params.verbose;
      this._warning = params.warning;
      this._error = params.error;
    }
  }

  verbose(message: string, data: any) {
    if (this._verbose) {
      const timestamp = this.getTimestamp();
      console.log(timestamp, message, data);
      if (this.onLog) {
        this?.onLog({ timestamp, message, data });
      }
      this.logs.push({ type: 'verbose', timestamp, message, data, id: data?.id });
    }
  }

  warn(message: string, data: any) {
    if (this._warning) {
      const timestamp = this.getTimestamp();
      console.warn(timestamp, message, data);
      if (this.onLog) {
        this?.onLog({ timestamp, message, data });
      }
      this.logs.push({ type: 'warn', timestamp, message, data, id: data?.id });
    }
  }

  error(message: string, data: any) {
    if (this._error) {
      const timestamp = this.getTimestamp();
      console.error(timestamp, message, data);
      if (this.onLog) {
        this?.onLog({ timestamp, message, data });
      }
      this.logs.push({ type: 'error', timestamp, message, data, id: data?.id });
    }
  }

  getLogs() {
    return this.logs;
  }

  setLogListener(callback: Function) {
    this.onLog = callback;
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

  getTimestamp(): string {
    const d = new Date();

    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    const millis = d.getMilliseconds().toString().padStart(3, '0');

    return `${hh}:${mm}:${ss}:${millis}`;
  }
}
