import { AppError } from "@shared/errors/AppError";

export namespace CreateUserError {
  export class EmailAlreadyUsed extends AppError {
    constructor() {
      super("Email already in use");
    }
  }
}
