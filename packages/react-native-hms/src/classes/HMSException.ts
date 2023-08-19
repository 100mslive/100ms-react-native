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
