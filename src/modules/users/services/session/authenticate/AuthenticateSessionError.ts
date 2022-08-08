import { AppError } from "@shared/errors/AppError";

export namespace AuthenticateSessionError {
  export class IncorrectEmailOrPasswordError extends AppError {
    constructor() {
      super("Incorrect email/password combination.", 401);
    }
  }
}
