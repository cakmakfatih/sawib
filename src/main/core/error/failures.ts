class Failure {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

class BrowserFailure extends Failure {
  message: string;
  error?: Error;

  constructor(message: string, error?: Error) {
    super(message);

    this.error = error;
  }
}

export {
  Failure,
  BrowserFailure,
};
