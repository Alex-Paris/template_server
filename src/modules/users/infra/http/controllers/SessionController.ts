import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AuthenticateSessionService } from "@modules/users/services/authenticateSession/AuthenticateSessionService";

export class SessionController {
  /** Authenticate user session generating a new token and refresh token. */
  async authenticate(req: Request, res: Response): Promise<Response> {
    // Get email and pass in body request to match a created user.
    const { email, password } = req.body;
    // Get remote address for refresh token register.
    const remote_address = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const authenticateUser = container.resolve(AuthenticateSessionService);

    const { user, token, refresh_token, refresh_expiration } =
      await authenticateUser.execute({
        email,
        password,
        remote_address,
      });

    return (
      res
        // Refresh token go inside a cookie so they are not accessible to
        // client-side javascript which prevents XSS (cross site scripting)
        // attacks.
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          expires: refresh_expiration,
        })
        .json({
          user: instanceToInstance(user),
          token,
        })
    );
  }
}
