import { AppError } from "@shared/errors/AppError";

export namespace UpdateAvatarUserError {
  export class NotAuthenticatedUser extends AppError {
    constructor() {
      super("Only authenticated users can change avatar.", 401);
    }
  }
}
