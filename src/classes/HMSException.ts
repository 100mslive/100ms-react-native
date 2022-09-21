export class HMSException {
  code: number;
  description: string;
  message?: string; // android only
  name?: string; // android only
  action?: string; // android only
  isTerminal: boolean;
  canRetry?: boolean; // ios only

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
