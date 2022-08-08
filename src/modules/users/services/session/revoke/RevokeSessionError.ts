import { AppError } from "@shared/errors/AppError";

export namespace RevokeSessionError {
  export class RefreshTokenNotFound extends AppError {
    constructor() {
      super("Refresh Token not found.", 401);
    }
  }

  export class RefreshTokenInvalid extends AppError {
    constructor() {
      super("Invalid Refresh Token.", 401);
    }
  }

  export class RefreshTokenExpired extends AppError {
    constructor() {
      super("Expired Refresh Token.", 401);
    }
  }

  export class RefreshTokenRevoked extends AppError {
    constructor() {
      super("Refresh Token already revoked.", 401);
    }
  }
}
