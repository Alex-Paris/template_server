import { AppError } from "@shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateUserError {
  export class EmailAlreadyUsed extends AppError {
    constructor() {
      super("Email already in use");
    }
  }
}
