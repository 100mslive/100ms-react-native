export class HMSException {
  public error: {
    code: number;
    description: string;
    localizedDescription: string;
    message: string;
    name: string;
    action: string;
  };
  public event: string;

  constructor(params: {
    error: {
      code: number;
      description: string;
      localizedDescription: string;
      message: string;
      name: string;
      action: string;
    };
    event: string;
  }) {
    this.error = {
      code: params.error.code,
      description: params.error.description,
      localizedDescription: params.error.localizedDescription,
      message: params.error.message,
      name: params.error.name,
      action: params.error.action,
    };
    this.event = params.event;
  }
}
