import { AppError } from "@shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UpdateAvatarUserError {
  export class NotAuthenticatedUser extends AppError {
    constructor() {
      super("Only authenticated users can change avatar.", 401);
    }
  }
}
