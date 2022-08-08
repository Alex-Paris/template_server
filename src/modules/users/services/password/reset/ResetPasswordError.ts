import { AppError } from "@shared/errors/AppError";

export namespace ResetPasswordError {
  export class ForgotTokenInvalid extends AppError {
    constructor() {
      super("Invalid Token.", 401);
    }
  }

  export class ForgotTokenNotFound extends AppError {
    constructor() {
      super("Token not found.", 401);
    }
  }

  export class ForgotTokenExpired extends AppError {
    constructor() {
      super("Expired Token.", 401);
    }
  }

  export class ForgotTokenRevoked extends AppError {
    constructor() {
      super("Token already revoked.", 401);
    }
  }

  export class UserNotFound extends AppError {
    constructor() {
      super("User does not exists.", 404);
    }
  }
}
