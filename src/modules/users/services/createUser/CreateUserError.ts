import { AppError } from "@shared/errors/AppError";

export class CreateUserError extends AppError {
  constructor() {
    super("Email already in use");
  }
}
