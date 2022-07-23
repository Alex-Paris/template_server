/* eslint-disable max-classes-per-file */
import { AppError } from "@shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ForgotPasswordError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User does not exists.", 404);
    }
  }
}
