import { AppError } from "@shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthenticateSessionError {
  export class IncorrectEmailOrPasswordError extends AppError {
    constructor() {
      super("Incorrect email/password combination.", 401);
    }
  }
}
